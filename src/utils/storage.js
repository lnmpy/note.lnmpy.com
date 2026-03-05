export const generateId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const getNotes = () => {
  try {
    const notesString = localStorage.getItem('notes')
    return notesString ? JSON.parse(notesString) : {}
  } catch (e) {
    return {}
  }
}

export const saveNotes = (notes) => {
  localStorage.setItem('notes', JSON.stringify(notes))
}

export const getNote = (id) => {
  const notes = getNotes()
  return notes[id] || null
}

export const saveNote = (id, content, title) => {
  const notes = getNotes()
  notes[id] = {
    id,
    content,
    title,
    updatedAt: Date.now()
  }
  saveNotes(notes)
}

export const deleteNote = (id) => {
  const notes = getNotes()
  delete notes[id]
  saveNotes(notes)
}
