export default function LoginPage() {
  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 420,
        margin: "80px auto",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>Sign in</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Login with Amazon
      </p>

      <form action='/auth/mock' method="post" style={{ marginTop: 18 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#374151' }}>Email</span>
          <input 
            name="email"
            type="email"
            required
            placeholder="analyst@noco.com"
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#374151' }}>Password</span>
          <input 
            name="password"
            type="password"
            required
            placeholder="••••••••"
            style={{
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign in with Amazon
        </button>
      </form>
    </main>
  );
}