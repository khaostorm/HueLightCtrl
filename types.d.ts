export interface BridgeConfig {
    ip:string,
    username:string
}

export interface BridgeFile {
    [ip:string]: BridgeConfig;
}