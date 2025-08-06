import React, { useState } from 'react'

const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ.')
      return
    }
    console.log('Đã đăng ký với email:', email)
    setError('')
    setEmail('')
    alert('Đăng ký thành công!')
  }

  return (
    <div className="w-full flex justify-center px-5 md:px-12 lg:px-15 my-10">
      <div className="w-full bg-gray-100 rounded-xl p-8 lg:p-20 flex flex-col lg:flex-row items-center justify-between shadow-sm">
        {/* Left */}
        <div className="lg:w-1/2 w-full text-left lg:pr-10 mb-6 lg:mb-0">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nhận thông tin mới nhất</h2>
          <p className="text-gray-600 text-base">
            Đăng ký nhận bản tin của chúng tôi và cập nhật thông tin mới nhất.
          </p>
        </div>

        {/* Right */}
        <form
          className="lg:w-1/2 w-full flex flex-col items-center lg:items-end"
          onSubmit={handleSubscribe}
        >
          <div className="w-full flex flex-col lg:flex-row items-center gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="px-4 py-3 text-base border border-gray-300 rounded w-full lg:w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-8 py-3 text-base bg-gray-900 text-white rounded hover:bg-gray-800 transition w-full lg:w-42"
            >
              Đăng ký
            </button>
          </div>
          <div className="min-h-[1.25rem] w-full  mt-1">
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewsletterSignup
