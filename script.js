async function fetchData() {

  try {

    const response = await fetch(API_URL);

    const text = await response.text();

    console.log("RAW RESPONSE:", text);

    const data = JSON.parse(text);

    console.log("JSON:", data);

  } catch (err) {

    console.error("FETCH ERROR:", err);
  }
}
