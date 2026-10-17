// Shown for the moment it takes to ask the server whether someone is signed in
const SessionLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex items-center gap-3 text-slate-500 text-sm">
      <span className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-[#0e2a47] animate-spin" />
      Loading…
    </div>
  </div>
)

export default SessionLoading
