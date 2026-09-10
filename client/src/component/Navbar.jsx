function Navbar() {
    return (
        <nav style={{ padding: '20px', backgroundColor: '#001f3f', color: 'white' }}>
            <h2>FutureSelector</h2>
            <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
                <li>Home</li>
                <li>Compare Institutes</li>
                <li>Login</li>
            </ul>
    </nav>
    )
}

export default Navbar;