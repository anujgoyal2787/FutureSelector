function InstituteCard(props){
    return (
            <div style={{ border: '1px solid gray', padding: '15px', margin: '10px', borderRadius: '8px' }}>
                <h3>{props.name}</h3>
                <p>City: {props.city}</p>
                <p>Exam: {props.exam}</p>
                <button>View Details</button>
            </div> 
    )
}

export default InstituteCard;