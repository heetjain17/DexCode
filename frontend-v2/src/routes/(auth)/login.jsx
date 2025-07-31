import { LoginForm } from '@/components/auth/Login-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='flex justify-center items-center h-screen'>
      <LoginForm />
    </div>
)
}
