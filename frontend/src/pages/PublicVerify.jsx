import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import VerifyCard from '../components/VerifyCard.jsx';

export default function PublicVerify() {
  const { batchId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { setData(null); api.publicVerify(batchId).then(setData).catch((e) => setErr(e.message)); }, [batchId]);
  return (
    <div className="public">
      <div className="brand center"><span className="logo">⬡</span> PharmaChain</div>
      {err && <div className="alert err">{err}</div>}
      {!data && !err && <p className="center muted">Checking blockchain record…</p>}
      <VerifyCard data={data} />
      <p className="center"><Link to="/login" className="muted small">Administrator login</Link></p>
    </div>
  );
}
