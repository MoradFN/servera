<template>
  <div class="about">
    <div class="about-container">
      <h1>Welcome to Servera</h1>
      <p>
        Servera is your ultimate restaurant management solution, designed to help restaurant owners
        create an impressive online presence, manage their menus, and connect with customers seamlessly.
      </p>
      <p>
        With Servera, you can easily:
        <ul>
          <li>Customize your restaurant pages, including menu, about, and contact sections.</li>
          <li>Manage orders and reservations efficiently.</li>
          <li>Attract more customers with professional-looking layouts and features.</li>
        </ul>
      </p>
      <p>
        Our mission is to empower restaurants of all sizes to grow their online footprint and deliver
        exceptional customer experiences. Whether you run a small café or a chain of restaurants, Servera
        has everything you need to succeed.
      </p>
      <button class="learn-more-btn">Learn More</button>
    </div>
  </div>
</template>
<style scoped>
.about {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(to right, #003399, #007bff);
  color: #ffffff;
}

.about-container {
  max-width: 800px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #ffd700;
}

p {
  font-size: 1.2rem;
  margin: 1rem 0;
  line-height: 1.6;
}

ul {
  text-align: left;
  margin: 1rem auto;
  list-style-type: disc;
  padding-left: 2rem;
}

ul li {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.learn-more-btn {
  margin-top: 2rem;
  padding: 0.8rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: #003399;
  background-color: #ffd700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.learn-more-btn:hover {
  background-color: #ffc107;
}

@media (min-width: 1024px) {
  .about {
    padding: 4rem;
  }

  h1 {
    font-size: 3rem;
  }

  p {
    font-size: 1.4rem;
  }
}
</style>
