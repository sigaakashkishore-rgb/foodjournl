import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaSave, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [mealData, setMealData] = useState({
    food_name: '',
    meal_type: 'lunch',
    quantity: 1,
    unit: 'serving'
  });

  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Your browser does not support voice recording');
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setMealData({
      food_name: '',
      meal_type: 'lunch',
      quantity: 1,
      unit: 'serving'
    });
    toast.success('Recording deleted');
  };

  const processVoiceInput = async () => {
    if (!audioBlob) {
      toast.error('Please record some audio first');
      return;
    }

    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-recording.wav');

      const response = await axios.post('/api/voice/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setTranscription(response.data.data.transcription);
      toast.success('Voice processed successfully!');

      // Try to extract meal information from transcription
      extractMealInfo(response.data.data.transcription);
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice input. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const extractMealInfo = (text) => {
    // Simple text analysis to extract meal information
    const lowerText = text.toLowerCase();

    // Extract food name (look for common food keywords)
    const foodKeywords = [
      'rice', 'bread', 'chicken', 'fish', 'vegetables', 'salad', 'pasta', 'pizza',
      'burger', 'sandwich', 'soup', 'curry', 'noodles', 'fruit', 'apple', 'banana',
      'orange', 'grapes', 'milk', 'yogurt', 'cheese', 'eggs', 'cereal', 'oatmeal'
    ];

    let detectedFood = '';
    for (const keyword of foodKeywords) {
      if (lowerText.includes(keyword)) {
        detectedFood = keyword;
        break;
      }
    }

    // Extract meal type
    let mealType = 'lunch'; // default
    if (lowerText.includes('breakfast') || lowerText.includes('morning')) {
      mealType = 'breakfast';
    } else if (lowerText.includes('dinner') || lowerText.includes('evening')) {
      mealType = 'dinner';
    } else if (lowerText.includes('snack')) {
      mealType = 'snack';
    }

    // Extract quantity (look for numbers)
    const quantityMatch = text.match(/(\d+)\s*(?:cup|bowl|piece|serving|gram|oz)/i);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

    // Extract unit
    let unit = 'serving';
    if (lowerText.includes('cup')) unit = 'cup';
    else if (lowerText.includes('bowl')) unit = 'bowl';
    else if (lowerText.includes('piece')) unit = 'piece';
    else if (lowerText.includes('gram')) unit = 'grams';

    if (detectedFood) {
      setMealData({
        food_name: detectedFood,
        meal_type: mealType,
        quantity: quantity,
        unit: unit
      });
      toast.success('Meal information extracted from your voice input!');
    }
  };

  const saveMeal = async () => {
    if (!mealData.food_name.trim()) {
      toast.error('Please enter a food name or process your voice input');
      return;
    }

    try {
      const mealPayload = {
        ...mealData,
        voice_transcription: transcription,
        nutrition: {
          calories: 0, // This would be calculated by AI service
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        ayurvedic_properties: {
          dosha_effect: { vata: 'neutral', pitta: 'neutral', kapha: 'neutral' }
        }
      };

      await axios.post('/api/meals', mealPayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Meal saved successfully!');
      deleteRecording(); // Reset form
    } catch (error) {
      console.error('Save meal error:', error);
      toast.error('Failed to save meal. Please try again.');
    }
  };

  return (
    <div className="food-background">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="dashboard-card fade-in">
              <Card.Body>
                <div className="text-center mb-4">
                  <FaMicrophone size={50} className="text-primary mb-3" />
                  <h2>Voice Journal</h2>
                  <p className="text-muted">
                    Record your meal by speaking about what you ate
                  </p>
                </div>

                {/* Recording Section */}
                <div className="text-center mb-4">
                  <div className={`voice-recorder mb-4 ${isRecording ? 'recording' : ''}`}>
                    <FaMicrophone size={60} className="mb-3" />
                    <h4>{isRecording ? 'Recording...' : 'Ready to Record'}</h4>
                    <p className="mb-4">
                      {isRecording
                        ? 'Speak clearly about your meal'
                        : 'Click the button below to start recording'
                      }
                    </p>

                    <div className="d-flex justify-content-center gap-3">
                      {!isRecording ? (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={startRecording}
                          disabled={!!audioBlob}
                        >
                          <FaMicrophone className="me-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="lg"
                          onClick={stopRecording}
                        >
                          <FaStop className="me-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  {audioBlob && (
                    <div className="mb-4">
                      <h5>Recording Controls</h5>
                      <div className="d-flex justify-content-center gap-3 mb-3">
                        <Button
                          variant="success"
                          onClick={playAudio}
                        >
                          {isPlaying ? <FaPause /> : <FaPlay />}
                          {isPlaying ? 'Pause' : 'Play'}
                        </Button>
                        <Button
                          variant="info"
                          onClick={processVoiceInput}
                          disabled={processing}
                        >
                          {processing ? 'Processing...' : 'Process Voice'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={deleteRecording}
                        >
                          <FaTrash />
                          Delete
                        </Button>
                      </div>

                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        controls
                        className="w-100"
                        style={{ maxWidth: '400px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Transcription Display */}
                {transcription && (
                  <Alert variant="info" className="mb-4">
                    <Alert.Heading>Voice Transcription</Alert.Heading>
                    <p className="mb-0">{transcription}</p>
                  </Alert>
                )}

                {/* Meal Form */}
                <Card className="mt-4">
                  <Card.Header>
                    <h5>Meal Details</h5>
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
                          onClick={saveMeal}
                          disabled={!mealData.food_name.trim()}
                        >
                          <FaSave className="me-2" />
                          Save Meal Entry
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>

                {/* Instructions */}
                <Alert variant="light" className="mt-4">
                  <h6>Voice Recording Tips:</h6>
                  <ul className="mb-0">
                    <li>Speak clearly and at a normal pace</li>
                    <li>Mention the food name, meal type, and quantity</li>
                    <li>Example: "I had a bowl of rice for lunch"</li>
                    <li>Make sure your microphone is not muted</li>
                  </ul>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VoiceRecorder;
