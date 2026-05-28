import fs from "fs";
import path from "path";

const logoPath = path.join(
  process.cwd(),
  "public",
  "logo2.png"
);

const logoBase64 =
  fs.readFileSync(logoPath, {
    encoding: "base64",
  });

export default logoBase64;