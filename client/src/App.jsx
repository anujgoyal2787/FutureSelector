import { useState } from "react";
import Navbar from "./component/Navbar";
import InstituteCard from "./component/InstituteCard";

// This is our fake "database" for now
const dummyInstitutes = [
  { id: 1, name: "Allen Career Institute", city: "Kota", exam: "JEE / NEET" },
  { id: 2, name: "Resonance", city: "Kota", exam: "JEE" },
  { id: 3, name: "Aakash Institute", city: "Delhi", exam: "NEET" },
  { id: 4, name: "FIITJEE", city: "Delhi", exam: "JEE" }
];

function App() {
  // 1. State to remember what the user types in the search box
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Filter the institutes based on what the user typed!
  // If searchQuery is "Kota", it only keeps institutes where city includes "Kota"
  const filteredInstitutes = dummyInstitutes.filter((institute) => {
    return institute.city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <Navbar />  

      <div style={{ padding: '20px' }}>
        <h1>Find Your Right Coaching</h1>
        
        {/* 3. The Search Bar! When we type, it updates the state. */}
        <input 
          type="text" 
          placeholder="Search by city (e.g., Kota, Delhi)..." 
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          style={{ padding: '10px', width: '300px', marginBottom: '20px' }}
        />

        {/* 4. We use .map() to loop through our filtered list and create a card for each one */}
        {filteredInstitutes.map((institute) => (
          <InstituteCard 
            key={institute.id} 
            name={institute.name} 
            city={institute.city} 
            exam={institute.exam} 
          />
        ))}
        
      </div>
    </>
  )
}

export default App;
