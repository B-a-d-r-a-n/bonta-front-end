#!/bin/bash

# Script to either load a structured file into directories/files or
# dump selected files from the current directory structure into a structured file.
# Operates relative to the current working directory where the script is called.
DEFAULT_OUTPUT_FILE="output.txt"
START_DELIM_PATTERN="^==== START (.*) ====$"
END_DELIM_PATTERN="^==== END (.*) ====$"

mode=""
fzf_mode=0
input_files=()
output_file=""
fzf_dump_selection_files=()

written_files=0
created_dirs=0

usage() {
	echo "Usage: $(basename "$0") [-l [-fzf | input_file...]] | [-d [-fzf] [output_file]]"
	echo ""
	echo "Modes:"
	echo "  -l, --load    : Load files/directories from structured input file(s)."
	echo "  -d, --dump    : Dump selected files from current directory structure into a file."
	echo ""
	echo "Options for Load Mode (-l):"
	echo "  -fzf          : Use fzf to interactively select one or more input files"
	echo "                  from the current directory recursively. Overrides specific"
	echo "                  input_file arguments."
	echo "  input_file... : Specify one or more input files to load (if -fzf not used)."
	echo "                  Defaults to '$DEFAULT_INPUT_FILE' if no files or -fzf specified."
	echo ""
	echo "Options for Dump Mode (-d):"
	echo "  -fzf          : Use fzf to interactively select one or more files from the"
	echo "                  current directory recursively TO BE DUMPED."
	echo "  output_file   : Specify the output file name. Defaults to '$DEFAULT_OUTPUT_FILE'."
	echo "                  This argument can come before or after -fzf for -d."
	echo ""
	echo "General Options:"
	echo "  -h, --help    : Show this help message."
	echo ""
	echo "Note: Exactly one mode (-l or -d) must be specified."
	echo "      -fzf requires either -l or -d to be set first."
	exit 1
}

temp_input_files=()
temp_output_file=""
temp_fzf=0

while [[ "$#" -gt 0 ]]; do
	case "$1" in
	-l | --load)
		if [[ -n "$mode" ]]; then
			echo "Error: Mode already set to '$mode'. Cannot set to 'load'." >&2
			usage
		fi
		mode="load"
		shift
		;;
	-d | --dump)
		if [[ -n "$mode" ]]; then
			echo "Error: Mode already set to '$mode'. Cannot set to 'dump'." >&2
			usage
		fi
		mode="dump"
		shift
		;;
	-fzf)
		if [[ -z "$mode" ]]; then
			echo "Error: -fzf option requires -l or -d mode to be specified first." >&2
			usage
		fi
		temp_fzf=1
		shift
		;;
	-h | --help)
		usage
		;;
	-*)
		echo "Error: Unknown option '$1'." >&2
		usage
		;;
	*) # Positional argument
		if [[ -z "$mode" ]]; then
			echo "Error: Positional arguments require -l or -d mode." >&2
			usage
		fi

		if [[ "$mode" == "load" ]]; then
			temp_input_files+=("$1")
		elif [[ "$mode" == "dump" ]]; then
			if [[ -n "$temp_output_file" ]]; then
				echo "Error: Multiple output files specified for dump mode." >&2
				usage
			fi
			temp_output_file="$1"
		fi
		shift
		;;
	esac
done

# --- Post-parsing validation and setup ---

if [[ -z "$mode" ]]; then
	echo "Error: No mode (-l or -d) specified." >&2
	usage
fi

# Apply temporary variables to final variables based on mode
fzf_mode=$temp_fzf

if [[ "$mode" == "load" ]]; then
	if [[ "$fzf_mode" -eq 1 ]]; then
		# Check if fzf is installed
		if ! command -v fzf &>/dev/null; then
			echo "Error: fzf is not installed." >&2
			echo "Please install fzf to use the -fzf option (e.g., brew install fzf, sudo apt-get install fzf)." >&2
			exit 1
		fi

		if [[ ${#temp_input_files[@]} -gt 0 ]]; then
			echo "Warning: Specific input file(s) were specified, but -fzf was also used." >&2
			echo "Using fzf selection for input files. The specified files will be ignored." >&2
		fi

		echo "Using fzf to select input file(s) for loading... Use TAB to select multiple, ENTER to confirm."
		# Use process substitution < <(...) to pipe find/fzf output directly to readarray
		readarray -d $'\0' -t input_files < <(find . -type f -not -path '*/\.git/*' -not -path '*/node_modules/*' -print0 | fzf --read0 --print0 --multi --cycle --exit-0 --prompt="Select input file(s) to load > ")
		fzf_status=$? # Capture fzf exit status

		if [[ "$fzf_status" -ne 0 ]]; then
			echo "File selection cancelled via fzf (exit code $fzf_status). Exiting." >&2
			exit 1
		fi

		for i in "${!input_files[@]}"; do
			input_files[$i]="${input_files[$i]%$'\n'}"
		done

		if [[ ${#input_files[@]} -gt 0 && -z "${input_files[-1]}" ]]; then
			unset 'input_files[-1]'
		fi

		if [[ ${#input_files[@]} -eq 0 ]]; then
			echo "No files selected via fzf for loading. Exiting." >&2
			exit 0
		fi

	elif [[ ${#temp_input_files[@]} -gt 0 ]]; then
		input_files=("${temp_input_files[@]}")
	else
		echo "No input file specified. Using default: '$DEFAULT_INPUT_FILE'"
		input_files=("$DEFAULT_INPUT_FILE")
	fi

	if [[ ${#input_files[@]} -eq 0 ]]; then
		echo "Error: No input files specified or selected for loading." >&2
		usage
	fi

elif [[ "$mode" == "dump" ]]; then
	output_file="${temp_output_file:-$DEFAULT_OUTPUT_FILE}"

	if [[ "$fzf_mode" -eq 1 ]]; then
		if ! command -v fzf &>/dev/null; then
			echo "Error: fzf is not installed." >&2
			echo "Please install fzf to use the -fzf option (e.g., brew install fzf, sudo apt-get install fzf)." >&2
			exit 1
		fi

		echo "Using fzf to select files for dumping... Use TAB to select multiple, ENTER to confirm."
		readarray -d $'\0' -t fzf_dump_selection_files < <(find . -type f -not -path '*/\.git/*' -not -path '*/node_modules/*' -print0 |
			grep -v -z "^./$output_file$" | # Exclude the output file path itself (null-aware grep)
			fzf --read0 --print0 --multi --cycle --exit-0 --prompt="Select file(s) to dump > ")
		fzf_status=$?

		if [[ "$fzf_status" -ne 0 ]]; then
			echo "File selection cancelled via fzf (exit code $fzf_status). Exiting." >&2
			exit 1
		fi

		for i in "${!fzf_dump_selection_files[@]}"; do
			fzf_dump_selection_files[$i]="${fzf_dump_selection_files[$i]%$'\n'}"
		done

		if [[ ${#fzf_dump_selection_files[@]} -gt 0 && -z "${fzf_dump_selection_files[-1]}" ]]; then
			unset 'fzf_dump_selection_files[-1]'
		fi

		if [[ ${#fzf_dump_selection_files[@]} -eq 0 ]]; then
			echo "No files selected via fzf for dumping. Exiting." >&2
			exit 0
		fi

	fi

fi

# --- Main Execution Block ---

if [[ "$mode" == "load" ]]; then

	echo "Starting file creation process from input file(s)..."
	echo "Input file(s) to load (${#input_files[@]}):"
	printf "  %s\n" "${input_files[@]}"
	for input_file in "${input_files[@]}"; do
		echo "--- Processing input file: '$input_file' ---"
		if [[ ! -f "$input_file" ]]; then
			echo "Error: Input file '$input_file' not found. Skipping." >&2
			continue
		fi

		current_file_being_written=""

		while IFS= read -r line || [[ -n "$line" ]]; do
			if [[ "$line" =~ $START_DELIM_PATTERN ]]; then
				current_file_path="${BASH_REMATCH[1]}"
				if [[ -z "${current_file_path// /}" ]]; then
					echo "Warning: Found empty or whitespace file path in START delimiter in '$input_file'. Skipping this block." >&2
					current_file_being_written="" # Ensure subsequent lines aren't written to a bad path
					continue
				fi

				current_file_being_written="$current_file_path"

				dir_path=$(dirname "$current_file_being_written")

				if [[ "$dir_path" != "." ]]; then
					if [[ ! -d "$dir_path" ]]; then
						mkdir -p "$dir_path"
						if [[ $? -eq 0 ]]; then
							echo "  Created directory: $dir_path"
							((created_dirs++))
						else
							echo "  Error creating directory: $dir_path from '$input_file'. Skipping file creation for '$current_file_being_written'." >&2
							# On directory creation failure, skip processing this file block
							current_file_being_written=""
							continue # Skip to the next line in the current input file
						fi
					fi
				fi

				if [[ -n "$current_file_being_written" ]]; then
					>"$current_file_being_written"
					echo "  Processing '$current_file_being_written'..."
				fi
				continue

			fi

			if [[ "$line" =~ $END_DELIM_PATTERN ]]; then
				if [[ -n "$current_file_being_written" && "${BASH_REMATCH[1]}" == "$current_file_being_written" ]]; then
					echo "  Finished writing '$current_file_being_written'."
					((written_files++))
					current_file_being_written=""
				else
					echo "Warning: Found END delimiter ('${BASH_REMATCH[1]}') without matching START or a filename mismatch in '$input_file'. Currently processing: '$current_file_being_written'. Line: '$line'" >&2
				fi
				continue
			fi

			if [[ -n "$current_file_being_written" ]]; then
				echo "$line" >>"$current_file_being_written"
			fi

		done <"$input_file"

		echo "--- Finished processing '$input_file' ---"
		echo ""

	done

	echo "-------------------------------------"
	echo "File creation process finished."
	echo "Input files processed: ${#input_files[@]}"
	echo "Directories created: $created_dirs"
	echo "Files written/overwritten: $written_files"
	echo "Please check the created files/directories in the current location ($(pwd))."

elif [[ "$mode" == "dump" ]]; then

	echo "Starting file dumping process from current directory ('.') to '$output_file'..."

	>"$output_file"

	declare -a files_to_dump

	if [[ "$fzf_mode" -eq 1 ]]; then
		files_to_dump=("${fzf_dump_selection_files[@]}")
		echo "Dumping selected files (${#files_to_dump[@]}):"
		printf "  %s\n" "${files_to_dump[@]}"
	else
		echo "Finding all files in '.' (excluding output file '$output_file')..."
		readarray -d $'\0' -t files_to_dump < <(find . -type f -not -path '*/\.git/*' -not -path '*/node_modules/*' -not -path '*/build/*' -not -path '*/dist/*' -not -name '*.png' -not -name "package-lock.json" -not -name '*.ico' -not -name '*.jpg' -not -name '*.jpeg' -not -name '*.gif' -not -name '*.db' -not -name '*.icon' -not -name '*.svg' -not -name '*.mp4' -not -name '*.mkv' -not -name '*.avi' -print0 | grep -v -z "^./$output_file$")

		for i in "${!files_to_dump[@]}"; do
			files_to_dump[$i]="${files_to_dump[$i]%$'\n'}"
		done

		if [[ ${#files_to_dump[@]} -gt 0 && -z "${files_to_dump[-1]}" ]]; then
			unset 'files_to_dump[-1]'
		fi

		if [[ ${#files_to_dump[@]} -eq 0 ]]; then
			echo "No files found to dump (excluding '$output_file')."
			echo "Output file '$output_file' created but empty."
			echo "-------------------------------------"
			echo "File dumping process finished."
			exit 0
		fi
		printf "Dumping all found files (%d).\n" ${#files_to_dump[@]}
	fi

	for file in "${files_to_dump[@]}"; do
		if [[ "$file" == "./$output_file" ]]; then
			echo "Warning: Attempted to dump the output file itself ('$file'). Skipping." >&2
			continue
		fi

		if [[ ! -f "$file" ]]; then
			echo "Warning: File to dump not found ('$file'). Skipping." >&2
			continue
		fi

		echo "==== START $file ====" >>"$output_file"

		cat "$file" >>"$output_file"

		echo "==== END $file ====" >>"$output_file"

		# echo "" >>"$output_file"

	done

	echo "-------------------------------------"
	echo "File dumping process finished."
	echo "Output written to '$output_file' in the current directory ($(pwd))."
	echo "Please check the file contents."

else
	echo "Internal Error: Invalid mode '$mode'." >&2
	exit 1
fi
