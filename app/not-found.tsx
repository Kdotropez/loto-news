import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Page non trouvée</h2>
        <p className="text-gray-600 mb-6">La page que vous cherchez n'existe pas.</p>
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  )
}
