import { WebContainer } from "@webcontainer/api"
import { useState, useEffect } from "react"

interface PreviewFrameProps {
  files: any[]
  webcontainer: WebContainer
}

export function PreviewFrame({ webcontainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("")

  async function main() {
    const installProcess = await webcontainer.spawn("npm", ["install"])

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data)
        },
      })
    )

    await webcontainer.spawn("npm", ["run", "dev"])
    // here wait for the server to start
    webcontainer.on("server-ready", (port, url) => {
      console.log(url)
      console.log(port) 
      setUrl(url)
    })
  }

  useEffect(() => {
    main()
  }, [])

  return (
    <div>
      {!url && (
        <div className="text-center">
          <p className="mb-2">Loading...</p>
        </div>
      )}
      {url && <iframe width={'100%'} height={'100%'} src={url} />}
    </div>
  )
}
