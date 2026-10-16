import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Stage } from './stage/Stage'
import { fromHash } from './demo/controller'
import { useDemo } from './store/store'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Stage />
  </StrictMode>,
)

// open the chapter/step in the URL (e.g. #/2/3), or the title slide
requestAnimationFrame(fromHash)

// handle for automated checks and debugging from the browser console
;(window as unknown as { stylist: typeof useDemo }).stylist = useDemo
