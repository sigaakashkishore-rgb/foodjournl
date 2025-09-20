import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaCamera, FaUpload, FaTimes, FaCheck } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [mealData, setMealData] = useState({
    food_name: '',
    meal_type: 'lunch',
    quantity: 1,
    unit: 'serving'
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setAnalysis(response.data.data.analysis);
      toast.success('Image uploaded and analyzed successfully!');

      // Pre-fill meal data with analysis results
      if (response.data.data.analysis?.identified_foods?.[0]) {
        const food = response.data.data.analysis.identified_foods[0];
        setMealData(prev => ({
          ...prev,
          food_name: food.name,
          quantity: food.quantity || 1,
          unit: food.unit || 'serving'
        }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!mealData.food_name.trim()) {
      toast.error('Please enter a food name');
      return;
    }

    try {
      const mealPayload = {
        ...mealData,
        nutrition: analysis?.nutrition || {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        ayurvedic_properties: analysis?.ayurvedic_properties || {
          dosha_effect: { vata: 'neutral', pitta: 'neutral', kapha: 'neutral' }
        }
      };

      await axios.post('/api/meals', mealPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Meal saved successfully!');
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setAnalysis(null);
      setMealData({
        food_name: '',
        meal_type: 'lunch',
        quantity: 1,
        unit: 'serving'
      });
    } catch (error) {
      console.error('Save meal error:', error);
      toast.error('Failed to save meal. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="food-background">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="dashboard-card fade-in">
              <Card.Body>
                <div className="text-center mb-4">
                  <FaCamera size={50} className="text-primary mb-3" />
                  <h2>Food Image Recognition</h2>
                  <p className="text-muted">
                    Upload a photo of your food to automatically identify and analyze it
                  </p>
                </div>

                {/* Image Upload Area */}
                <div className="mb-4">
                  {!preview ? (
                    <div
                      {...getRootProps()}
                      className={`image-upload-area ${isDragActive ? 'dragover' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <FaUpload size={40} className="text-primary mb-3" />
                      <h4>
                        {isDragActive ? 'Drop your image here' : 'Upload Food Image'}
                      </h4>
                      <p className="text-muted">
                        Drag and drop an image here, or click to select
                      </p>
                      <small className="text-muted">
                        Supports: JPG, PNG, GIF, WebP (max 10MB)
                      </small>
                    </div>
                  ) : (
                    <div className="position-relative">
                      <img
                        src={preview}
                        alt="Food preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        className="position-absolute top-0 end-0 m-2"
                        onClick={removeImage}
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                {preview && (
                  <div className="text-center mb-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <FaCamera className="me-2" />
                          Analyze Food Image
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Analysis Results */}
                {analysis && (
                  <Alert variant="success" className="mb-4">
                    <Alert.Heading>
                      <FaCheck className="me-2" />
                      Food Analysis Complete!
                    </Alert.Heading>

                    {analysis.identified_foods && analysis.identified_foods.length > 0 && (
                      <div className="mb-3">
                        <h5>Identified Foods:</h5>
                        {analysis.identified_foods.map((food, index) => (
                          <div key={index} className="mb-2">
                            <strong>{food.name}</strong>
                            {food.confidence && (
                              <small className="text-muted ms-2">
                                ({Math.round(food.confidence * 100)}% confidence)
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis.nutrition && (
                      <div className="mb-3">
                        <h5>Nutrition Information:</h5>
                        <div className="d-flex flex-wrap gap-2">
                          <span className="nutrition-badge">
                            {analysis.nutrition.calories} cal
                          </span>
                          <span className="nutrition-badge">
                            {analysis.nutrition.protein}g protein
                          </span>
                          <span className="nutrition-badge">
                            {analysis.nutrition.carbohydrates}g carbs
                          </span>
                          <span className="nutrition-badge">
                            {analysis.nutrition.fat}g fat
                          </span>
                        </div>
                      </div>
                    )}

                    {analysis.ayurvedic_properties && (
                      <div>
                        <h5>Ayurvedic Properties:</h5>
                        <div className="d-flex flex-wrap gap-2">
                          {Object.entries(analysis.ayurvedic_properties.dosha_effect).map(([dosha, effect]) => (
                            <span key={dosha} className={`nutrition-badge ayurvedic-${dosha}`}>
                              {dosha}: {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </Alert>
                )}

                {/* Meal Form */}
                {analysis && (
                  <Card className="mt-4">
                    <Card.Header>
                      <h5>Save as Meal Entry</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Food Name</Form.Label>
                              <Form.Control
                                type="text"
                                value={mealData.food_name}
                                onChange={(e) => setMealData({...mealData, food_name: e.target.value})}
                                placeholder="Enter food name"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Meal Type</Form.Label>
                              <Form.Select
                                value={mealData.meal_type}
                                onChange={(e) => setMealData({...mealData, meal_type: e.target.value})}
                              >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                                <option value="other">Other</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Quantity</Form.Label>
                              <Form.Control
                                type="number"
                                min="0"
                                step="0.1"
                                value={mealData.quantity}
                                onChange={(e) => setMealData({...mealData, quantity: parseFloat(e.target.value)})}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Unit</Form.Label>
                              <Form.Select
                                value={mealData.unit}
                                onChange={(e) => setMealData({...mealData, unit: e.target.value})}
                              >
                                <option value="serving">Serving</option>
                                <option value="grams">Grams</option>
                                <option value="cup">Cup</option>
                                <option value="piece">Piece</option>
                                <option value="bowl">Bowl</option>
                                <option value="plate">Plate</option>
                                <option value="ml">Milliliters</option>
                                <option value="oz">Ounces</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <div className="text-center">
                          <Button
                            variant="success"
                            size="lg"
                            onClick={handleSaveMeal}
                          >
                            Save Meal Entry
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ImageUpload;
