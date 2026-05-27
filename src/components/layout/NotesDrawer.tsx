import { useState, useEffect, useRef } from 'react'
import { Send, StickyNote } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/store/uiStore'
import { useClientStore, selectActiveClient } from '@/store/clientStore'
import { Avatar } from '@/components/ui'
import { relativeTime, cn } from '@/lib/utils'
import type { DbNote } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  firmId: string
  user: User | null
  displayName: string
}

export function NotesDrawer({ firmId, user, displayName }: Props) {
  const { notesOpen, closeNotes } = useUiStore()
  const activeClient = useClientStore(selectActiveClient)
  const [notes, setNotes] = useState<DbNote[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const feedRef = useRef<HTMLDivElement>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!notesOpen || !activeClient?.id || !firmId) return
    supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', activeClient.id)
      .eq('firm_id', firmId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setNotes(data as DbNote[]) })
  }, [notesOpen, activeClient?.id, firmId])

  useEffect(() => {
    if (notesOpen) setTimeout(() => feedRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50)
  }, [notes.length, notesOpen])

  async function postNote() {
    if (!body.trim() || !activeClient?.id || !user?.id || !firmId) return
    setSending(true)
    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: activeClient.id,
        firm_id: firmId,
        author_id: user.id,
        category: 'general',
        body: body.trim(),
      })
      .select()
      .single()
    setSending(false)
    if (!error && data) {
      setNotes(n => [...n, data as DbNote])
      setBody('')
    }
  }

  async function deleteNote(id: string) {
    await supabase.from('client_notes').delete().eq('id', id)
    setNotes(n => n.filter(x => x.id !== id))
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); postNote() }
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeNotes}
        className={cn(
          'fixed inset-0 bg-black/15 z-[799] transition-opacity duration-250',
          notesOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-screen w-[460px] bg-white border-l border-border flex flex-col z-[800]"
        style={{
          transform: notesOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)',
          boxShadow: '-12px 0 48px rgba(0,0,0,.14)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[18px] bg-navy border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <StickyNote className="w-4 h-4 text-white/70" />
            <span className="font-serif text-[18px] text-white">
              {activeClient?.data?.name ? `${activeClient.data.name} — Notes` : 'Client Notes'}
            </span>
          </div>
          <button
            onClick={closeNotes}
            className="bg-white/12 hover:bg-white/22 text-white rounded-[7px] px-2.5 py-1 text-[18px] leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Feed */}
        <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-border">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-16 text-center gap-2">
              <StickyNote className="w-10 h-10 text-border" />
              <p className="text-[13.5px] font-medium text-text-md">No notes yet</p>
              <p className="text-[12px] text-text-lt leading-relaxed">
                Add notes for the team below.<br />They're visible to everyone in your firm.
              </p>
            </div>
          ) : notes.map(note => (
            <div key={note.id} className="bg-white border border-border rounded-[10px] px-4 py-3.5 hover:border-border-dk transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <Avatar name={displayName || 'U'} size="sm" />
                <span className="text-[12.5px] font-semibold text-text">{displayName || 'Team member'}</span>
                <span className="text-[11px] text-text-lt ml-auto">{relativeTime(note.created_at)}</span>
                {note.author_id === user?.id && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-border hover:text-danger text-[15px] leading-none opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  >
                    ×
                  </button>
                )}
              </div>
              <p className="text-[13px] text-text leading-relaxed whitespace-pre-wrap">{note.body}</p>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="border-t border-border px-5 pt-3.5 pb-4 bg-white flex-shrink-0 flex flex-col gap-2">
          <textarea
            ref={taRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add a note for the team… (Ctrl+Enter to send)"
            className="w-full px-3.5 py-2.5 border border-border rounded-[9px] text-[13px] font-sans text-text bg-surface resize-none outline-none min-h-[68px] max-h-[130px] leading-relaxed focus:border-navy-lt focus:bg-white focus:shadow-[0_0_0_3px_rgba(30,52,86,.07)] transition-all"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 flex-1">
              <Avatar name={displayName || 'U'} size="sm" />
              <span className="text-[11.5px] text-text-lt">{displayName || 'You'}</span>
            </div>
            <button
              onClick={postNote}
              disabled={!body.trim() || sending}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy hover:bg-navy-lt text-white text-[12.5px] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              Post note
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
