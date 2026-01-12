export default function BuscadorLey({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Buscar por palabra clave"
      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
    />
  );
}
