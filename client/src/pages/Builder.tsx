import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { StepsList } from "../components/StepsList"
import { FileExplorer } from "../components/FileExplorer"
import { TabView } from "../components/TabView"
import { CodeEditor } from "../components/CodeEditor"
import { PreviewFrame } from "../components/PreviewFrame"
import { Step, FileItem, StepType } from "../types"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { parseXml } from "../steps"
import { useWebContainer } from "../hooks/useWebContainer"
import { Loader } from "../components/Loader"
import { cleanCodeContent } from "../utils/cleanCode"

export default function Builder() {
  const location = useLocation()
  const { prompt } = location.state as { prompt: string }
  const [userPrompt, setPrompt] = useState("")
  const [llmMessages, setLlmMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([])
  const [loading, setLoading] = useState(false)
  const [templateSet, setTemplateSet] = useState(false)
  const webcontainer = useWebContainer()

  const [currentStep, setCurrentStep] = useState(1)
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code")
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)

  const [steps, setSteps] = useState<Step[]>([])

  const [files, setFiles] = useState<FileItem[]>([])

  useEffect(() => {
    let originalFiles = [...files]
    let updateHappened = false
    steps
      .filter(({ status }) => status === "pending")
      .map((step) => {
        updateHappened = true
        if (step?.type === StepType.CreateFile) {
          let parsedPath = step.path?.split("/") ?? []
          let currentFileStructure = [...originalFiles]
          let finalAnswerRef = currentFileStructure

          let currentFolder = ""
          while (parsedPath.length) {
            currentFolder = `${currentFolder}/${parsedPath[0]}`
            let currentFolderName = parsedPath[0]
            parsedPath = parsedPath.slice(1)

            if (!parsedPath.length) {
              let file = currentFileStructure.find(
                (x) => x.path === currentFolder
              )
              if (!file) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "file",
                  path: currentFolder,
                  content: step.code,
                })
              } else {
                file.content = step.code
              }
            } else {
              let folder = currentFileStructure.find(
                (x) => x.path === currentFolder
              )
              if (!folder) {
                currentFileStructure.push({
                  name: currentFolderName,
                  type: "folder",
                  path: currentFolder,
                  children: [],
                })
              }

              currentFileStructure = currentFileStructure.find(
                (x) => x.path === currentFolder
              )!.children!
            }
          }
          originalFiles = finalAnswerRef
        }
      })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps((steps) =>
        steps.map((s: Step) => {
          return {
            ...s,
            status: "completed",
          }
        })
      )
    }
    console.log(files)
  }, [steps, files])

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {}

      const processFile = (file: FileItem, isRootFolder: boolean) => {
        if (file.type === "folder") {
          mountStructure[file.name] = {
            directory: file.children
              ? Object.fromEntries(
                  file.children.map((child) => [
                    child.name,
                    processFile(child, false),
                  ])
                )
              : {},
          }
        } else if (file.type === "file") {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || "",
              },
            }
          } else {
            return {
              file: {
                contents: file.content || "",
              },
            }
          }
        }

        return mountStructure[file.name]
      }

      files.forEach((file) => processFile(file, true))

      return mountStructure
    }

    const mountStructure = createMountStructure(files)

    console.log(mountStructure)
    webcontainer?.mount(mountStructure)
  }, [files, webcontainer])

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim(),
    })
    setTemplateSet(true)

    const { prompts, uiPrompts } = response.data

    setSteps(
      parseXml(uiPrompts[0]).map((x: Step) => ({
        ...x,
        code: x.code ? cleanCodeContent(x.code) : x.code,
        status: "pending",
      }))
    )

    setLoading(true)
    const promptsToBackend = [...prompts, prompt].map((content: any) => ({
      role: "user",
      content,
    }))

    console.log(promptsToBackend)

    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: promptsToBackend,
    })

    setLoading(false)

    setSteps((s) => [
      ...s,
      ...parseXml(stepsResponse.data.response).map((x) => ({
        ...x,
        code: x.code ? cleanCodeContent(x.code) : x.code,
        status: "pending" as "pending",
      })),
    ])

    setLlmMessages(
      [...prompts, prompt].map((content) => ({
        role: "user",
        content,
      }))
    )

    setLlmMessages((x) => [
      ...x,
      { role: "assistant", content: stepsResponse.data.response },
    ])
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-100">Website Builder</h1>
        <p className="text-sm text-gray-400 mt-1">Prompt: {prompt}</p>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-4 gap-6 p-6">
          <div className="col-span-1 space-y-6 overflow-auto">
            <div>
              <div className="max-h-[75vh] overflow-scroll">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={(stepId: Number) => setCurrentStep(stepId as any)}
                />
              </div>
              <div>
                <div className="flex">
                  <br />
                  {(loading || !templateSet) && <Loader />}
                  {!(loading || !templateSet) && (
                    <div className="flex">
                      <textarea
                        value={userPrompt}
                        onChange={(e) => {
                          setPrompt(e.target.value)
                        }}
                        className="p-2 w-full"
                      ></textarea>
                      <button
                        onClick={async () => {
                          const newMessage = {
                            role: "user" as "user",
                            content: userPrompt,
                          }

                          setLoading(true)
                          const stepsResponse = await axios.post(
                            `${BACKEND_URL}/chat`,
                            {
                              messages: [...llmMessages, newMessage],
                            }
                          )
                          setLoading(false)

                          setLlmMessages((x) => [...x, newMessage])
                          setLlmMessages((x) => [
                            ...x,
                            {
                              role: "assistant",
                              content: stepsResponse.data.response,
                            },
                          ])

                          setSteps((s) => [
                            ...s,
                            ...parseXml(stepsResponse.data.response).map(
                              (x) => ({
                                ...x,
                                code: x.code
                                  ? cleanCodeContent(x.code)
                                  : x.code,
                                status: "pending" as "pending",
                              })
                            ),
                          ])
                        }}
                        className="bg-purple-400 px-4"
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <FileExplorer files={files} onFileSelect={setSelectedFile} />
          </div>
          <div className="col-span-2 bg-gray-900 rounded-lg shadow-lg p-4 h-[calc(100vh-8rem)]">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="h-[calc(100%-4rem)]">
              {activeTab === "code" ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer!} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
