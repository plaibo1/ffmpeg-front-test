// import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useEffect, useState, useRef } from "react";

export const GifConverter = () => {
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState<File | undefined>();
  const [gif, setGif] = useState("");

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.4/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    setReady(true);
  };

  useEffect(() => {
    load()
      .then((res) => {
        console.log("____RES: ", res);
        return res;
      })
      .catch((err) => {
        console.log("SOMETHING GOES WRONG: \n", err);
        return err;
      });
  }, []);

  const convertToGif = async () => {
    // Write the file to memory
    // ffmpeg.FS("writeFile", "test.mp4", await fetchFile(video));
    const ffmpeg = ffmpegRef.current;

    ffmpeg.writeFile("test.mp4", await fetchFile(video));

    // Run the FFMpeg command
    await ffmpeg.exec([
      "-i",
      "test.mp4",
      "-t",
      "2.5",
      "-ss",
      "2.0",
      "-f",
      "gif",
      "out.gif",
    ]);

    // Read the result
    const fileData = await ffmpeg.readFile("out.gif");

    // Create a URL
    const url = URL.createObjectURL(
      new Blob([fileData], { type: "image/gif" })
    );

    setGif(url);
  };

  return ready ? (
    <div className="App">
      <p ref={messageRef}></p>

      {video && (
        <video controls width="250" src={URL.createObjectURL(video)}></video>
      )}

      <input
        type="file"
        onChange={(e) => setVideo(e.target.files?.item(0) || undefined)}
      />

      <h3>Result</h3>

      <button onClick={convertToGif}>Convert</button>

      {gif && <img src={gif} width="250" />}
    </div>
  ) : (
    <p>Loading...</p>
  );
};
