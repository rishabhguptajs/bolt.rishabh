import { WebContainer } from "@webcontainer/api"
import { useState, useEffect } from "react"

interface PreviewFrameProps {
  files: any[]
  webContainer: WebContainer
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("")

  async function main() {
    const installProcess = await webContainer.spawn("npm", ["install"])

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log(data)
        },
      })
    )

    await webContainer.spawn("npm", ["run", "dev"])
    webContainer.on("server-ready", (port, url) => {
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
      {url && <iframe width={'1000px'} height={'1000px'} src={url} />}
    </div>
  )
}
