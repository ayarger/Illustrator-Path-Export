# illustrator_export_paths_to_png
An Adobe Illustrator ExtendScript extension that exports individual path objects to PNG files.

## Usage
1. Open Illustrator: Launch Illustrator and open the document you would like to export.
2. Prepare Document: Ensure that your illustrator document only has one layer. This layer should contain all of the path objects you wish to export.
3. Launch Script: Drag the .jsx script onto the Illustrator Window, or open Adobe ExtendScript Toolkit CC, set Illustrator as the target, and click the run button.

## Output
You will find a new folder at <path_of_illustrator_file>_symbols/. This folder contains the exported pngs of every path object in the illustrator file, in addition to a json file (skeleton.json) describing the position data of every object (useful for integrating with other tools, such as Esoteric Software's Spine Animation).
