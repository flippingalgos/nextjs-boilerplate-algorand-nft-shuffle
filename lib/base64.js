export function base64Encode(input) {
    return btoa(input.reduce((str, byte) => str + String.fromCharCode(byte), ""));
}

export function base64Decode(input) {
    return new Uint8Array(atob(input).split("").reduce((arr, chr) => arr.concat([chr.charCodeAt(0)]), []));
}