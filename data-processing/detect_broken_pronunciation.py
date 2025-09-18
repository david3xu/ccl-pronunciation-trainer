#!/usr/bin/env python3
"""
Script to detect vocabulary entries with broken pronunciation formatting.
Identifies entries that still use the old /x/y/z/ format instead of proper IPA.
"""

import re
import sys

def detect_broken_pronunciations(file_path):
    """
    Detect entries with broken pronunciation formatting.
    Returns list of line numbers and entries that need fixing.
    """
    broken_entries = []

    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Pattern to match broken pronunciation format: /x/y/z/ pattern
    broken_pattern = re.compile(r'/[a-z]/[a-z]/.*?/ — sounds like')

    # Pattern to match entries that start with broken format: //x/y/z/
    broken_pattern2 = re.compile(r'//[a-z]/.*?/ — sounds like')

    # Pattern to match mixed broken formats
    broken_pattern3 = re.compile(r'/[a-z]/[a-z].*?/[a-z].*?/ — sounds like')

    for i, line in enumerate(lines, 1):
        line = line.strip()

        # Skip headers and empty lines
        if not line or line.startswith('#') or '|' not in line:
            continue

        # Check if line contains vocabulary entry
        if '— sounds like' in line:
            # Check for various broken patterns
            if (broken_pattern.search(line) or
                broken_pattern2.search(line) or
                broken_pattern3.search(line)):

                # Extract the entry number and word
                parts = line.split('|')
                if len(parts) >= 3:
                    entry_part = parts[0].strip()
                    word_part = parts[1].strip()
                    pronunciation_part = parts[2].strip()

                    broken_entries.append({
                        'line_number': i,
                        'entry': entry_part,
                        'word': word_part,
                        'pronunciation': pronunciation_part[:100] + '...' if len(pronunciation_part) > 100 else pronunciation_part,
                        'full_line': line
                    })

    return broken_entries

def main():
    file_path = '/home/291928k/eng-workspace/ccl-pronunciation-trainer/data-processing/vocabulary-clean.md'

    print("🔍 Detecting entries with broken pronunciation formatting...")
    print("=" * 80)

    broken_entries = detect_broken_pronunciations(file_path)

    if not broken_entries:
        print("✅ No broken pronunciation entries found! All entries appear to be properly formatted.")
        return

    print(f"❌ Found {len(broken_entries)} entries with broken pronunciation formatting:\n")

    # Group by entry number ranges for easier processing
    print("📋 BROKEN ENTRIES LIST:")
    print("-" * 80)

    for i, entry in enumerate(broken_entries, 1):
        print(f"{i:3d}. Line {entry['line_number']:4d} | {entry['entry']} | {entry['word']}")
        print(f"     Broken pronunciation: {entry['pronunciation']}")
        print()

    # Summary by ranges
    print("\n📊 SUMMARY BY LINE RANGES:")
    print("-" * 40)

    ranges = {}
    for entry in broken_entries:
        range_key = f"{(entry['line_number'] // 100) * 100}-{(entry['line_number'] // 100) * 100 + 99}"
        if range_key not in ranges:
            ranges[range_key] = []
        ranges[range_key].append(entry)

    for range_key, entries in sorted(ranges.items()):
        print(f"Lines {range_key}: {len(entries)} entries")
        for entry in entries[:3]:  # Show first 3 as examples
            print(f"  - {entry['entry']} | {entry['word']}")
        if len(entries) > 3:
            print(f"  - ... and {len(entries) - 3} more")
        print()

    print(f"\n🎯 NEXT STEPS:")
    print(f"1. Total entries to fix: {len(broken_entries)}")
    print(f"2. Focus on ranges with most entries first")
    print(f"3. Use the line numbers to locate entries quickly")
    print(f"4. Apply the same pattern: proper IPA + UK/US distinctions")

    # Save detailed list to file
    output_file = '/home/291928k/eng-workspace/ccl-pronunciation-trainer/data-processing/broken_entries_list.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("BROKEN PRONUNCIATION ENTRIES\n")
        f.write("=" * 50 + "\n\n")

        for entry in broken_entries:
            f.write(f"Line {entry['line_number']}: {entry['entry']} | {entry['word']}\n")
            f.write(f"Current: {entry['pronunciation']}\n")
            f.write("-" * 50 + "\n")

    print(f"\n💾 Detailed list saved to: {output_file}")

if __name__ == "__main__":
    main()
