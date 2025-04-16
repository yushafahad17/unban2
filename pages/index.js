import { useState } from "react";

export default function Home() {
  const [nomor, setNomor] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/unbanwa?nomor=${nomor}`);
    const data = await res.json();

    if (data.status) {
      setMessage(data.message);
    } else {
      setMessage(data.message);
    }
  };

  return (
    <div className="container">
      <div className="content">
        <h1>Permintaan Unban WhatsApp</h1>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Masukkan Nomor WhatsApp"
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="btn">Kirim Permintaan</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}
