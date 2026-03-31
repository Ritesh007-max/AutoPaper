import { TeacherSidebar, TeacherTopbar } from './TeacherDashboardUi'

function TeacherLayout({ navItems, activeKey, children }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <TeacherSidebar navItems={navItems} activeKey={activeKey} />

      <div className="flex flex-col min-h-screen xl:ml-[260px]">
        <TeacherTopbar />

        <section className="flex-1 p-6 lg:p-8 max-w-7xl">
          {children}
        </section>
      </div>
    </main>
  )
}

export default TeacherLayout
