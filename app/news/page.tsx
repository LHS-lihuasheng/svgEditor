import fs from "fs"
import path from "path"
import { remark } from "remark"
import html from "remark-html"

export default async function NewsPage() {
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md")
  const fileContents = fs.readFileSync(changelogPath, "utf8")

  const processedContent = await remark().use(html).process(fileContents)
  const contentHtml = processedContent.toString()

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Development News</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </div>
  )
}

