/*
illustrator_path_export.jsx

This script exports individual path objects to pngs.
It uses a temporary layer to isolate individual path objects and hide the rest.
*/

function main() {
    var doc = app.activeDocument;    
    if (doc.layers.length != 1) {
        alert("ERROR: The export script requires the Illustrator document to contain exactly one layer.");
        return;
    }

    // Create a new, temporary layer.
    var new_layer = doc.layers.add();  
    new_layer.locked = false;
    new_layer.visible = true;

    // Create a new directory for output.
    var doc_path = app.activeDocument.fullName.fsName;
    var new_dir = new Folder(doc_path.substring(0, doc_path.length-3) + "_symbols");
    if (new_dir.exists) {
        var files = new_dir.getFiles();
        var num_files = files.length;
        for (var i = 0; i < num_files; i++) {
                files[i].remove();
        }
        new_dir.remove();
    }
    new_dir.create();

    // Create the JSON Spine config file.
    var config_file=new File(new_dir + "/skeleton.json");
    config_file.open('w');

    // Throughout the export process, track the area used by the path objects as a whole.
    var glargest_x = -9999999;
    var gsmallest_x = 9999999;
    var glargest_y = -9999999;
    var gsmallest_y = 9999999;

    // The various sections of the config json file are built concurrently. 
    var intro_json = "";
    var bone_json = "";
    var skins_json = "\"skins\": {\"default\": {";
    for(var i = doc.layers[1].pathItems.length-1; i > -1 ; i--) {
        geom_centroid = get_geometric_centroid(doc.layers[1].pathItems[0].pathPoints);
         if (geom_centroid.x > glargest_x)
            glargest_x = geom_centroid.x;
        if (geom_centroid.x < gsmallest_x)
            gsmallest_x = geom_centroid.x;
        if (geom_centroid.y > glargest_y)
            glargest_y = geom_centroid.y;
        if (geom_centroid.y < gsmallest_y)
            gsmallest_y = geom_centroid.y;

        // In order to isolate each object for individual export, we use one layer that is visible, and one layer that is hidden.
        // Swapping symbols between these layers allow us to control what is visible.
        swap_and_snap(new_layer, doc.layers[1], doc.layers[1].pathItems[0], i);
        
        bone_json += "{\"name\":\"" + i.toString() + "\",\"bone\":\"root\",\"attachment\":\"" + i.toString() + "\"}";    
        skins_json += "\"" + i.toString() + "\":{\"" + i.toString() + "\":{\"x\":" + geom_centroid.x + ",\"y\":" + geom_centroid.y + ",\"width\":" + geom_centroid.width + ",\"height\":" + geom_centroid.height + "}}";

        // JSON standards demand that the final item in a list not have a trailing comma
        if(i != 0) {
            bone_json += ",";
            skins_json += ",";
        }
    }

    // Finalize the json file sections and write to file.
    intro_json = "{\"skeleton\": { \"hash\": \"a7Ea+VnCt4WwQc+QofZt7R8TBpQ\", \"spine\": \"3.6.36\", \"width\":" + (glargest_x - gsmallest_x).toString() + ", \"height\":" + (glargest_y - gsmallest_y).toString() + ", \"images\": \"./budget_detective_symbols/\" },\"bones\": [{ \"name\": \"root\" }],\"slots\": [";
    bone_json += "],";
    skins_json += "}},\"animations\":{\"animations\":{}}}";
    config_file.write(intro_json + bone_json + skins_json);

    // Make the layers visible again.
    for(var i = 0; i < doc.layers.length; i++) {
            doc.layers[i].visible = true;
    }
      
    function swap_and_snap(dest_layer, asset_layer, path_item, path_item_number) {
        // Move object to export layer
        with (app.activeDocument) {    
            asset_layer.visible = true;
            path_item.move(dest_layer, ElementPlacement.PLACEATEND);
            asset_layer.visible = false;
        }

        // Export PNG file
        doc_path = app.activeDocument.fullName.fsName;
        new_dir = new Folder(doc_path.substring(0, doc_path.length-3) + "_symbols");
        var dir = new_dir;
        dir.changePath(path_item_number.toString() + '.png');
        savePNG(dir);  

         // move object back to asset layer
         with (app.activeDocument) {    
            asset_layer.visible = true;
            path_item.move(asset_layer, ElementPlacement.PLACEATEND);
            asset_layer.visible = false;
        }
    }
      
    function savePNG(file) {  
     var exp = new ExportOptionsPNG24();  
     exp.transparency = true;  
     doc.exportFile(file, ExportType.PNG24, exp);  
    }  

    function get_geometric_centroid(pts) {
        largest_x = -99999999;
        smallest_x = 99999999;
        largest_y = -99999999;
        smallest_y = 99999999;

        for (var i = 0; i < pts.length; i++) {
                var p = pts[i].anchor;
                var x = p[0];
                var y = p[1];
                
                if (x > largest_x)
                    largest_x = x;
                if (x < smallest_x)
                    smallest_x = x;
                if (y > largest_y)
                    largest_y = y;
                if (y < smallest_y)
                    smallest_y = y;
        }

        return {"x": (largest_x + smallest_x) * 0.5, "y": (largest_y + smallest_y) * 0.5, "width": largest_x - smallest_x, "height": largest_y - smallest_y};
    }

    // Cleanup temporary layer and file handlers.
    new_layer.remove();
    config_file.close();
    alert("Exported!")
}

main();