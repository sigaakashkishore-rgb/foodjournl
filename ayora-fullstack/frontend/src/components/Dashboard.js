import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlus, FaCamera, FaMicrophone, FaUtensils, FaChartBar, FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [recentMeals, setRecentMeals] = useState([]);
  const [nutritionSummary, setNutritionSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch recent meals
      const mealsResponse = await axios.get('/api/meals/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch nutrition summary
      const nutritionResponse = await axios.get('/api/meals/nutrition-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch user profile
      const userResponse = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecentMeals(mealsResponse.data.data);
      setNutritionSummary(nutritionResponse.data.data);
      setUser(userResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getAyurvedicColor = (meal) => {
    // This would be determined by the meal's ayurvedic properties
    return 'ayurvedic-vata'; // Default for demo
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="food-background">
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-3 text-white">Loading your food journal...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="food-background">
      <Container className="py-5">
        {/* Welcome Section */}
        <Row className="mb-5">
          <Col>
            <Card className="dashboard-card fade-in">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h1 className="mb-3">
                      Welcome back, {user?.name || 'Foodie'}! 👋
                    </h1>
                    <p className="text-muted mb-4">
                      Track your meals, discover nutritional insights, and maintain your Ayurvedic balance.
                    </p>
                    <div className="d-flex gap-3 flex-wrap">
                      <Link to="/add-meal">
                        <Button variant="primary" size="lg">
                          <FaPlus className="me-2" />
                          Add Meal
                        </Button>
                      </Link>
                      <Link to="/upload-image">
                        <Button variant="success" size="lg">
                          <FaCamera className="me-2" />
                          Upload Food Image
                        </Button>
                      </Link>
                      <Link to="/voice-recorder">
                        <Button variant="info" size="lg">
                          <FaMicrophone className="me-2" />
                          Voice Journal
                        </Button>
                      </Link>
                    </div>
                  </Col>
                  <Col md={4} className="text-center">
                    <div className="mb-3">
                      <h3 className="text-primary">{recentMeals.length}</h3>
                      <p className="text-muted">Meals Today</p>
                    </div>
                    {nutritionSummary && (
                      <div>
                        <h4 className="text-success">{nutritionSummary.total_calories}</h4>
                        <p className="text-muted">Calories Consumed</p>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-5">
          <Col>
            <h3 className="text-white mb-4">Quick Actions</h3>
            <Row>
              <Col md={3} className="mb-3">
                <Card className="text-center h-100 meal-card">
                  <Card.Body>
                    <FaUtensils size={40} className="text-primary mb-3" />
                    <h5>Meal Journal</h5>
                    <p className="text-muted">Track your daily meals</p>
                    <Link to="/meals">
                      <Button variant="outline-primary">View Journal</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="text-center h-100 meal-card">
                  <Card.Body>
                    <FaChartBar size={40} className="text-success mb-3" />
                    <h5>Nutrition</h5>
                    <p className="text-muted">View your nutrition data</p>
                    <Link to="/meals">
                      <Button variant="outline-success">View Stats</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="text-center h-100 meal-card">
                  <Card.Body>
                    <FaCamera size={40} className="text-info mb-3" />
                    <h5>Food Recognition</h5>
                    <p className="text-muted">Upload food images</p>
                    <Link to="/upload-image">
                      <Button variant="outline-info">Upload Image</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3} className="mb-3">
                <Card className="text-center h-100 meal-card">
                  <Card.Body>
                    <FaUserMd size={40} className="text-warning mb-3" />
                    <h5>Doctor Review</h5>
                    <p className="text-muted">Get professional insights</p>
                    {user?.role === 'doctor' ? (
                      <Link to="/doctor">
                        <Button variant="outline-warning">Doctor Panel</Button>
                      </Link>
                    ) : (
                      <Button variant="outline-warning" disabled>
                        Patient View
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Recent Meals */}
        <Row className="mb-5">
          <Col>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-white">Recent Meals</h3>
              <Link to="/meals">
                <Button variant="outline-light">View All</Button>
              </Link>
            </div>

            {recentMeals.length === 0 ? (
              <Card className="dashboard-card text-center">
                <Card.Body>
                  <FaUtensils size={60} className="text-muted mb-3" />
                  <h4 className="text-muted">No meals recorded yet</h4>
                  <p className="text-muted">Start your food journal by adding your first meal!</p>
                  <Link to="/add-meal">
                    <Button variant="primary">Add Your First Meal</Button>
                  </Link>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {recentMeals.map((meal) => (
                  <Col md={4} key={meal._id} className="mb-4">
                    <Card className={`meal-card ${getAyurvedicColor(meal)}`}>
                      {meal.image_data?.url && (
                        <img
                          src={meal.image_data.url}
                          alt={meal.food_name}
                          className="meal-image"
                        />
                      )}
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="card-title">{meal.food_name}</h5>
                          <Badge bg="primary">{meal.meal_type}</Badge>
                        </div>
                        <p className="text-muted small mb-2">
                          {formatDate(meal.createdAt)}
                        </p>
                        {meal.nutrition && (
                          <div className="mb-3">
                            <div className="nutrition-badge">
                              {meal.nutrition.calories} cal
                            </div>
                            <div className="nutrition-badge">
                              {meal.nutrition.protein}g protein
                            </div>
                          </div>
                        )}
                        <Link to={`/meals/${meal._id}`}>
                          <Button variant="outline-primary" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Nutrition Summary */}
        {nutritionSummary && nutritionSummary.total_calories > 0 && (
          <Row>
            <Col>
              <Card className="dashboard-card">
                <Card.Body>
                  <h4 className="mb-4">Today's Nutrition Summary</h4>
                  <Row>
                    <Col md={3} className="text-center">
                      <h2 className="text-primary">{nutritionSummary.total_calories}</h2>
                      <p className="text-muted">Calories</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-success">{nutritionSummary.total_protein}g</h3>
                      <p className="text-muted">Protein</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-info">{nutritionSummary.total_carbs}g</h3>
                      <p className="text-muted">Carbs</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-warning">{nutritionSummary.total_fat}g</h3>
                      <p className="text-muted">Fat</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
