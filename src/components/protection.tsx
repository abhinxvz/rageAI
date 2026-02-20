"use client"

import { useEffect } from 'react'

export function Protection() {
    useEffect(() => {
        // Disable right-click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault()
            return false
        }

        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
        const handleKeyDown = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault()
                return false
            }

            // Ctrl+Shift+I (Inspect)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault()
                return false
            }

            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault()
                return false
            }

            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault()
                return false
            }

            // Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault()
                return false
            }

            // Ctrl+S (Save)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault()
                return false
            }
        }

        // Disable text selection
        const disableSelection = () => {
            document.body.style.userSelect = 'none'
            document.body.style.webkitUserSelect = 'none'
        }

        // DevTools detection
        const detectDevTools = () => {
            const threshold = 160
            const widthThreshold = window.outerWidth - window.innerWidth > threshold
            const heightThreshold = window.outerHeight - window.innerHeight > threshold

            if (widthThreshold || heightThreshold) {
                // DevTools detected - you can redirect or show warning
                console.clear()
            }
        }

        // Disable copy
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault()
            return false
        }

        // Disable drag
        const handleDragStart = (e: DragEvent) => {
            e.preventDefault()
            return false
        }

        // Add event listeners
        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('copy', handleCopy)
        document.addEventListener('dragstart', handleDragStart)
        disableSelection()

        // Check for DevTools periodically
        const devToolsInterval = setInterval(detectDevTools, 1000)

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('copy', handleCopy)
            document.removeEventListener('dragstart', handleDragStart)
            document.body.style.userSelect = ''
            document.body.style.webkitUserSelect = ''
            clearInterval(devToolsInterval)
        }
    }, [])

    return null
}
