package com.g6.acrobatteAPI.services;

import java.util.List;
import java.util.Optional;

import com.g6.acrobatteAPI.entities.Challenge;
import com.g6.acrobatteAPI.entities.Checkpoint;
import com.g6.acrobatteAPI.entities.CheckpointFactory;
import com.g6.acrobatteAPI.entities.Segment;
import com.g6.acrobatteAPI.models.checkpoint.CheckpointCreateModel;
import com.g6.acrobatteAPI.repositories.ChallengeRepository;
import com.g6.acrobatteAPI.repositories.CheckpointRepository;
import com.g6.acrobatteAPI.repositories.SegmentRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CheckpointServiceImpl implements CheckpointService {

    private final CheckpointRepository checkpointRepository;
    private final ChallengeRepository challengeRepository;
    private final SegmentRepository segmentRepository;

    @Override
    public Checkpoint findCheckpoint(Long id) {
        return checkpointRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Le checkpoint avec cet id n'existe pas"));
    }

    @Override
    public void deleteCheckpoint(Long id) {

        Checkpoint checkpoint = findCheckpoint(id);

        checkpointRepository.delete(checkpoint);

    }

    @Override
    public Checkpoint addCheckpoint(CheckpointCreateModel checkpointCreateModel) {

        Optional<Challenge> result = challengeRepository.findById(checkpointCreateModel.getChallengeId());

        if (result.isEmpty()) {
            throw new IllegalArgumentException("Le challenge avec cet id n'existe pas");
        }

        List<Long> segmentStartIds = checkpointCreateModel.getSegmentStartsIds();
        List<Segment> segmentsStart = null;
        if (segmentStartIds != null && !segmentStartIds.isEmpty()) {
            segmentsStart = segmentRepository.findByIdIsIn(segmentStartIds);
        }

        List<Long> segmentEndIds = checkpointCreateModel.getSegmentEndIds();
        List<Segment> segmentsEnd = null;
        if (segmentEndIds != null && !segmentEndIds.isEmpty()) {
            segmentsEnd = segmentRepository.findByIdIsIn(segmentEndIds);
        }

        Challenge challenge = result.get();

        Checkpoint checkpoint = CheckpointFactory.create(checkpointCreateModel, challenge, segmentsStart, segmentsEnd);

        checkpointRepository.save(checkpoint);

        return checkpoint;
    }

}