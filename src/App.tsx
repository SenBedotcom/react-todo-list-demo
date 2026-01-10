/**
 * React Todo List Application
 * แอปพลิเคชันจัดการรายการสิ่งที่ต้องทำ
 * 
 * Imports ที่ใช้:
 * - useState: Hook สำหรับจัดการ state ภายใน component
 * - useEffect: Hook สำหรับจัดการ side effects (เช่น บันทึกข้อมูลลง localStorage)
 * - FormEvent: Type สำหรับ event ของ form จาก React
 */
import { useState, useEffect, FormEvent } from 'react'
import './App.css'

/**
 * Interface Todo
 * กำหนดโครงสร้างข้อมูลของรายการ Todo แต่ละรายการ
 * 
 * @property id - รหัสเฉพาะของรายการ (ใช้ timestamp ในการสร้าง)
 * @property text - ข้อความรายละเอียดของรายการ
 * @property completed - สถานะว่าทำเสร็จหรือยัง (true = เสร็จ, false = ยังไม่เสร็จ)
 * @property createdAt - วันเวลาที่สร้างรายการ (ISO string format)
 */
interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: string
}

/**
 * FilterType
 * Union Type สำหรับกำหนดประเภทของตัวกรองรายการ
 * - 'all': แสดงทั้งหมด
 * - 'active': แสดงเฉพาะที่ยังไม่เสร็จ
 * - 'completed': แสดงเฉพาะที่เสร็จแล้ว
 */
type FilterType = 'all' | 'active' | 'completed'

/**
 * App Component
 * Component หลักของแอปพลิเคชัน Todo List
 */
function App() {
  /**
   * State: todos
   * เก็บรายการ Todo ทั้งหมด
   * ใช้ lazy initialization เพื่อโหลดข้อมูลจาก localStorage ตอนเริ่มต้น
   * ถ้าไม่มีข้อมูลจะเริ่มต้นด้วย array ว่าง
   */
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })

  /**
   * State: inputValue
   * เก็บค่าที่ผู้ใช้พิมพ์ในช่อง input สำหรับเพิ่มรายการใหม่
   */
  const [inputValue, setInputValue] = useState<string>('')

  /**
   * State: filter
   * เก็บค่าตัวกรองที่ผู้ใช้เลือก (all, active, completed)
   */
  const [filter, setFilter] = useState<FilterType>('all')

  /**
   * useEffect: บันทึกข้อมูลลง localStorage
   * ทุกครั้งที่ todos มีการเปลี่ยนแปลง จะบันทึกลง localStorage อัตโนมัติ
   * เพื่อให้ข้อมูลยังคงอยู่แม้ปิดเบราว์เซอร์
   */
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  /**
   * Function: addTodo
   * เพิ่มรายการ Todo ใหม่
   * 
   * @param e - FormEvent จากการ submit form
   * 
   * การทำงาน:
   * 1. ป้องกันการ refresh หน้า (e.preventDefault())
   * 2. ตรวจสอบว่า input ไม่ว่างเปล่า
   * 3. สร้าง Todo object ใหม่พร้อม id, text, สถานะ และเวลาที่สร้าง
   * 4. เพิ่มรายการใหม่ไว้ด้านบนสุดของ list
   * 5. ล้างค่า input
   */
  const addTodo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputValue.trim() === '') return
    
    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    setTodos([newTodo, ...todos])
    setInputValue('')
  }

  /**
   * Function: toggleTodo
   * สลับสถานะ completed ของรายการ Todo
   * 
   * @param id - รหัสของรายการที่ต้องการสลับสถานะ
   * 
   * การทำงาน:
   * ใช้ map เพื่อหารายการที่มี id ตรงกัน แล้วกลับค่า completed
   * (true -> false หรือ false -> true)
   */
  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  /**
   * Function: deleteTodo
   * ลบรายการ Todo ออกจาก list
   * 
   * @param id - รหัสของรายการที่ต้องการลบ
   * 
   * การทำงาน:
   * ใช้ filter เพื่อเก็บเฉพาะรายการที่ id ไม่ตรงกับที่ต้องการลบ
   */
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  /**
   * Function: clearCompleted
   * ล้างรายการที่เสร็จแล้วทั้งหมดออก
   * 
   * การทำงาน:
   * ใช้ filter เพื่อเก็บเฉพาะรายการที่ยังไม่เสร็จ (completed = false)
   */
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed))
  }

  /**
   * Computed Value: filteredTodos
   * กรองรายการ Todo ตามตัวกรองที่เลือก
   * 
   * การทำงาน:
   * - filter = 'active': แสดงเฉพาะที่ completed = false
   * - filter = 'completed': แสดงเฉพาะที่ completed = true
   * - filter = 'all': แสดงทั้งหมด
   */
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  /**
   * Computed Values: completedCount, activeCount
   * นับจำนวนรายการที่เสร็จแล้วและยังไม่เสร็จ
   * ใช้แสดงตัวเลขในปุ่มตัวกรอง
   */
  const completedCount = todos.filter(t => t.completed).length
  const activeCount = todos.length - completedCount

  /**
   * JSX Return
   * ส่วนแสดงผล UI ของแอปพลิเคชัน
   */
  return (
    <div className="todo-container">
      {/* Header: แสดงชื่อแอปและ subtitle */}
      <header className="todo-header">
        <h1>รายการสิ่งที่ต้องทำ</h1>
        <p className="subtitle">จัดการงานของคุณอย่างเป็นระบบ</p>
      </header>

      {/* Form: ฟอร์มสำหรับเพิ่มรายการใหม่ */}
      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="เพิ่มรายการใหม่..."
          className="todo-input"
        />
        <button type="submit" className="add-btn">
          <span className="btn-icon">+</span>
          <span className="btn-text">เพิ่ม</span>
        </button>
      </form>

      {/* Filter Tabs: ปุ่มตัวกรองรายการ (ทั้งหมด/ยังไม่เสร็จ/เสร็จแล้ว) */}
      <div className="filter-tabs">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด ({todos.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          ยังไม่เสร็จ ({activeCount})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          เสร็จแล้ว ({completedCount})
        </button>
      </div>

      {/* Todo List: แสดงรายการ Todo ที่ถูกกรองแล้ว */}
      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          /* Empty State: แสดงเมื่อไม่มีรายการ */
          <li className="empty-state">
            <div className="empty-icon">📝</div>
            <p>
              {filter === 'all' && 'ยังไม่มีรายการ เพิ่มรายการแรกของคุณเลย!'}
              {filter === 'active' && 'ไม่มีรายการที่ต้องทำ 🎉'}
              {filter === 'completed' && 'ยังไม่มีรายการที่เสร็จแล้ว'}
            </p>
          </li>
        ) : (
          /* Todo Items: แสดงรายการ Todo แต่ละรายการ */
          filteredTodos.map((todo, index) => (
            <li 
              key={todo.id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Checkbox: สำหรับ toggle สถานะเสร็จ/ยังไม่เสร็จ */}
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="checkmark"></span>
              </label>
              {/* ข้อความของรายการ */}
              <span className="todo-text">{todo.text}</span>
              {/* ปุ่มลบรายการ */}
              <button 
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label="ลบรายการ"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Footer: แสดงปุ่มล้างรายการที่เสร็จแล้ว (แสดงเฉพาะเมื่อมีรายการที่เสร็จ) */}
      {completedCount > 0 && (
        <div className="todo-footer">
          <button className="clear-btn" onClick={clearCompleted}>
            ล้างรายการที่เสร็จแล้ว ({completedCount})
          </button>
        </div>
      )}
    </div>
  )
}

export default App
