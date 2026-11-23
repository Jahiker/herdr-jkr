#!/bin/sh
# Copies the JKR layouts, theme and mods into the Herdr app's folder.
# Herdr picks them up live. Files with the same names are replaced; anything else
# already in those folders (fonts you added, for example) is kept.
set -eu

source_dir=$(cd "$(dirname "$0")" && pwd)
herdr_home=${HERDR_APP_HOME:-"$HOME/.config/herdr-app"}

if [ ! -d "$herdr_home" ]; then
  echo "Herdr app folder not found at $herdr_home (open the Herdr app once, or set HERDR_APP_HOME)." >&2
  exit 1
fi

mkdir -p "$herdr_home/layouts" "$herdr_home/themes" "$herdr_home/mods"
cp "$source_dir"/layouts/*.json "$herdr_home/layouts/"
cp "$source_dir"/themes/*.json "$herdr_home/themes/"
for mod_dir in "$source_dir"/mods/*/; do
  target_dir="$herdr_home/mods/$(basename "$mod_dir")"
  mkdir -p "$target_dir"
  # "dir/." copies the contents on both BSD (macOS) and GNU cp; "dir/" nests on GNU when the target exists.
  cp -R "$mod_dir." "$target_dir/"
done

echo "Installed into $herdr_home. Switch layout with ctrl-shift-l, or:"
echo "  herdr-app do layout.switch '{\"name\":\"jkr-deck\"}'"
