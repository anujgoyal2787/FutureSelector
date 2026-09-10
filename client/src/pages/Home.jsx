// This is your exact code from App.jsx, just moved here!
import { useState } from "react";
import InstituteCard from "../component/InstituteCard";

const dummyInstitutes = [
  { id: 1, name: "Allen Career Institute", city: "Kota", exam: "JEE / NEET" },
  { id: 2, name: "Resonance", city: "Kota", exam: "JEE" },
  { id: 3, name: "Aakash Institute", city: "Delhi", exam: "NEET" },
  { id: 4, name: "FIITJEE", city: "Delhi", exam: "JEE" }
];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInstitutes = dummyInstitutes.filter((institute) => {
    return institute.city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ padding: '20px' }}>
      <h1>Find Your Right Coaching</h1>
      <input 
        type="text" 
        placeholder="Search by city (e.g., Kota, Delhi)..." 
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        style={{ padding: '10px', width: '300px', marginBottom: '20px' }}
      />
      {filteredInstitutes.map((institute) => (
        <InstituteCard 
          key={institute.id} 
          name={institute.name} 
          city={institute.city} 
          exam={institute.exam} 
        />
      ))}
    </div>
  );
}

export default Home;
