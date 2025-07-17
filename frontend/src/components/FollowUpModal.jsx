import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import QuestionComponent from './QuestionComponent';

const FollowUpModal = ({ show, onClose, questions, values, onChange }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Quer nos contar mais?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {questions.map((q) => (
          <QuestionComponent
            key={q.id}
            question={q}
            value={values[q.id]}
            onChange={(val) => onChange(q.id, val)}
          />
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FollowUpModal;
