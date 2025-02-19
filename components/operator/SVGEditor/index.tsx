import React, { useState } from 'react'
import ComponentList from './components/ComponentList'
import EditorToolbar from './components/EditorToolbar'
import EditorCanvas from './components/EditorCanvas'
import PropertyPanel from './components/PropertyPanel'

export function SVGEditor() {
  const [imageUrl, setImageUrl] = useState<string>()
  
  return (
    <div className="h-full flex bg-gray-50">
      <ComponentList />
      <div className="flex-1">
        <EditorToolbar onImageSelect={setImageUrl} />
        <EditorCanvas imageUrl={imageUrl} />
      </div>
      <PropertyPanel />
    </div>
  )
} 