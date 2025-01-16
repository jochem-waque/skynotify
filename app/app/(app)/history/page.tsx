import Notifications from "./notifications"

export default function Page() {
  return (
    <main className="flex grow flex-col gap-4">
      <h1 className="text-2xl">Notification history</h1>
      <div className="flex flex-col gap-2">
        <Notifications></Notifications>
      </div>
    </main>
  )
}
