var doc = app.activeDocument;    
var symbolCount = doc.symbols.length;  
  
var num_paths = doc.pathItems.length ;  

// Hide current layers.
//for(var i = 0; i < doc.layers.length; i++) {
//        doc.layers[i].visible = false;
//}

 // create layer  
 var new_layer = doc.layers.add();  
 new_layer.locked = false;
 new_layer.visible = true;



var doc_path = app.activeDocument.fullName.fsName;
var new_dir = new Folder(doc_path.substring(0, doc_path.length-3) + "_symbols");
if (new_dir.exists) {
        var files = new_dir.getFiles();
        
        var num_files = files.length;
    
    for (var i = 0; i < num_files; i++) {
            files[i].remove();
             $.writeln("erased!");
    }

new_dir.remove();


}
new_dir.create();

// JSON Spine config file
var config_file=new File(new_dir + "/skeleton.json");
config_file.open('w');

with (app.activeDocument) {
//var myGuides = pathItems.rectangle(height -13.5, 13.5, width -27, height -27, false);
//myGuides.guides = true;
}

var glargest_x = -9999999;
var gsmallest_x = 9999999;
var glargest_y = -9999999;
var gsmallest_y = 9999999;

var j = 0;
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

    swap_and_snap(new_layer, doc.layers[1], doc.layers[1].pathItems[0], i);
    
    bone_json += "{\"name\":\"" + i.toString() + "\",\"bone\":\"root\",\"attachment\":\"" + i.toString() + "\"}";    
    skins_json += "\"" + i.toString() + "\":{\"" + i.toString() + "\":{\"x\":" + geom_centroid.x + ",\"y\":" + geom_centroid.y + ",\"width\":" + geom_centroid.width + ",\"height\":" + geom_centroid.height + "}}";

    
    if(i != 0) {
        bone_json += ",";
        skins_json += ",";
    }
    //var s = new_layer.pathItems.add(new_item);//new_item
    
    // save to document's folder  
    

    // delete temp symbol instance  
    //s.remove();
}

intro_json = "{\"skeleton\": { \"hash\": \"a7Ea+VnCt4WwQc+QofZt7R8TBpQ\", \"spine\": \"3.6.36\", \"width\":" + (glargest_x - gsmallest_x).toString() + ", \"height\":" + (glargest_y - gsmallest_y).toString() + ", \"images\": \"./budget_detective_symbols/\" },\"bones\": [{ \"name\": \"root\" }],\"slots\": [";
bone_json += "],";
skins_json += "}},\"animations\":{\"animations\":{}}}";

config_file.write(intro_json + bone_json + skins_json);

  // Hide current layers.
for(var i = 0; i < doc.layers.length; i++) {
        doc.layers[i].visible = true;
}



  
function swap_and_snap(dest_layer, asset_layer, path_item, path_item_number) {
    with (app.activeDocument) {    
        asset_layer.visible = true;
        path_item.move(dest_layer, ElementPlacement.PLACEATEND);
        asset_layer.visible = false;
    }

    doc_path = app.activeDocument.fullName.fsName;
    new_dir = new Folder(doc_path.substring(0, doc_path.length-3) + "_symbols");
    var dir = new_dir;
    $.writeln(path_item_number.toString());
    
    
    
    dir.changePath(path_item_number.toString() + '.png');

    // export symbols  

    savePNG(dir);  

     with (app.activeDocument) {    
        asset_layer.visible = true;
        path_item.move(asset_layer, ElementPlacement.PLACEATEND);
        asset_layer.visible = false;
    }
}
  
function savePNG(file) {  
 // save-for-web options  
 var exp = new ExportOptionsPNG24();  
 exp.transparency = true;  
 
 $.writeln(file);
 
 // export  
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

new_layer.remove();
config_file.close();
alert("Exported!")