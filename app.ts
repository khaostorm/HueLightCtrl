import fs from 'fs';
import * as hueApi from "node-hue-api";

//Custom Code import
import BridgeSetup from "./BridgeSetup";

//Types import
import { BridgeConfig, BridgeFile } from "./types";

try {
    let bridgeConfig: BridgeFile = JSON.parse(fs.readFileSync("./bridges.json", "utf8"));
    //if ip isn't specified then we assume theirs only one bridge and we connect to that one only
    let bridge: BridgeConfig = bridgeConfig[Object.keys(bridgeConfig)[0]];
    console.log(bridge);
} catch (err) {
    console.log("bridge.json not found: finding bridges and creating JSON file");
    BridgeSetup().then((newBridgeFile)=>{
        console.log("Bridge File generated rerun program");
        console.log(newBridgeFile);
        fs.writeFileSync("./bridges.json",newBridgeFile)
    }).catch((err)=>{
        console.log("Error Generating Bridge File");
        console.log(typeof err);
        console.log(err);
    });
}





