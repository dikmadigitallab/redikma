import {  Search,  Bell } from "lucide-react"

export function Header (){

    return(


      <header className="h-16 flex-shrink-0 shadow-sm z-40" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="h-full px-[10%] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>ReDikma</h1>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>Rede Social Corporativa</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--gray)' }} />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-transparent outline-none text-sm w-40"
                style={{ color: 'var(--black)' }}
              />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition">
              <Bell size={18} style={{ color: 'var(--gray)' }} />
              <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: 'var(--warning)' }}>3</span>
            </div>
            <img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-9 h-9 rounded-full cursor-pointer hover:opacity-70 transition" />
          </div>
        </div>
      </header>

    )
          {/* Header - Sticky */}

}