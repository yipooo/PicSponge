const magicNumberMapInput = [
    [/^%PDF-/, 'application/pdf'],
    [/^GIF87a/, 'image/gif'],
    [/^GIF89a/, 'image/gif'],
    [/^\x89PNG\x0D\x0A\x1A\x0A/, 'image/png'],
    [/^\xFF\xD8\xFF/, 'image/jpeg'],
    [/^BM/, 'image/bmp'],
    [/^I I/, 'image/tiff'],
    [/^II*/, 'image/tiff'],
    [/^MM\x00*/, 'image/tiff'],
    [/^RIFF....WEBPVP8[LX ]/s, 'image/webp'],
    [/^\xF4\xFF\x6F/, 'image/webp2'],
    [/^\x00\x00\x00 ftypavif\x00\x00\x00\x00/, 'image/avif'],
    [/^\xff\x0a/, 'image/jxl'],
    [/^\x00\x00\x00\x0cJXL \x0d\x0a\x87\x0a/, 'image/jxl'],
];

