package com.g6.acrobatteAPI.controllers;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import javax.validation.Valid;

import com.g6.acrobatteAPI.entities.Challenge;
import com.g6.acrobatteAPI.entities.Checkpoint;
import com.g6.acrobatteAPI.entities.Segment;
import com.g6.acrobatteAPI.entities.SegmentFactory;
import com.g6.acrobatteAPI.exceptions.ApiIdNotFoundException;
import com.g6.acrobatteAPI.exceptions.ApiWrongParamsException;
import com.g6.acrobatteAPI.models.segment.SegmentCreateModel;
import com.g6.acrobatteAPI.models.segment.SegmentResponseModel;
import com.g6.acrobatteAPI.models.segment.SegmentUpdateModel;
import com.g6.acrobatteAPI.services.ChallengeService;
import com.g6.acrobatteAPI.services.CheckpointService;
import com.g6.acrobatteAPI.services.SegmentService;

import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.ApiOperation;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/segments")
@Api(value = "Segment Controller", description = "API REST sur le Segment", tags = "Segment")
public class SegmentController {
    private final SegmentService segmentService;
    private final ChallengeService challengeService;
    private final CheckpointService checkpointService;
    private final ModelMapper modelMapper;

    @ApiOperation(value = "Récupérer le Segment par ID", response = Iterable.class, tags = "Segment")
    @ApiResponses(value = { //
            @ApiResponse(code = 200, message = "Success|OK"), //
            @ApiResponse(code = 401, message = "not authorized"), //
            @ApiResponse(code = 403, message = "forbidden"), //
            @ApiResponse(code = 404, message = "not found") //
    })
    @GetMapping("/{id}")
    public ResponseEntity<SegmentResponseModel> getById(@PathVariable("id") Long id) throws ApiIdNotFoundException {
        Segment segment = segmentService.getById(id).orElseThrow(() -> new ApiIdNotFoundException("Segment", id));

        if (segment == null) {
            return ResponseEntity.badRequest().body(null);
        }

        SegmentResponseModel response = modelMapper.map(segment, SegmentResponseModel.class);

        return ResponseEntity.ok().body(response);
    }

    @ApiOperation(value = "Récupérer tous les Segments par ID du Challenge", response = Iterable.class, tags = "Segment")
    @ApiResponses(value = { //
            @ApiResponse(code = 200, message = "Success|OK"), //
            @ApiResponse(code = 401, message = "not authorized"), //
            @ApiResponse(code = 403, message = "forbidden"), //
            @ApiResponse(code = 404, message = "not found") //
    })
    @GetMapping
    public ResponseEntity<List<SegmentResponseModel>> getAllByChallenge(@RequestParam Long challengeId)
            throws ApiIdNotFoundException {

        Challenge challenge = challengeService.findChallenge(challengeId);
        Set<Segment> segments = segmentService.findAllByChallenge(challenge);

        List<SegmentResponseModel> responses = segments.stream()
                .map(segment -> modelMapper.map(segment, SegmentResponseModel.class)).collect(Collectors.toList());

        return ResponseEntity.ok().body(responses);
    }

    @ApiOperation(value = "Créer un segment", response = Iterable.class, tags = "Segment")
    @ApiResponses(value = { //
            @ApiResponse(code = 200, message = "Success|OK"), //
            @ApiResponse(code = 401, message = "not authorized"), //
            @ApiResponse(code = 403, message = "forbidden"), //
            @ApiResponse(code = 404, message = "not found") //
    })
    @PostMapping
    public ResponseEntity<SegmentResponseModel> create(@Valid @RequestBody SegmentCreateModel segmentCreateModel)
            throws ApiIdNotFoundException, ApiWrongParamsException {

        Checkpoint start = checkpointService.findCheckpoint(segmentCreateModel.getCheckpointStartId());
        Checkpoint end = checkpointService.findCheckpoint(segmentCreateModel.getCheckpointEndId());

        Challenge challenge = challengeService.findChallenge(segmentCreateModel.getChallengeId());
        if (challenge == null) {
            throw new ApiIdNotFoundException("Challenge", segmentCreateModel.getChallengeId());
        }

        if (start.getId().equals(end.getId())) {
            throw new ApiWrongParamsException("start-end", null,
                    "Les enpoint de début et de fin ne peuvent être les mêmes");
        }

        Segment segment = SegmentFactory.create(segmentCreateModel, challenge, start, end);
        Segment persistedSegment = segmentService.create(segment);

        SegmentResponseModel response = modelMapper.map(persistedSegment, SegmentResponseModel.class);

        return ResponseEntity.ok().body(response);
    }

    @ApiOperation(value = "Modifier un Segment par ID", response = Iterable.class, tags = "Segment")
    @ApiResponses(value = { //
            @ApiResponse(code = 200, message = "Success|OK"), //
            @ApiResponse(code = 401, message = "not authorized"), //
            @ApiResponse(code = 403, message = "forbidden"), //
            @ApiResponse(code = 404, message = "not found") //
    })
    @PutMapping("/{id}")
    public ResponseEntity<SegmentResponseModel> update(@PathVariable("id") Long id,
            @Valid @RequestBody SegmentUpdateModel segmentUpdateModel)
            throws ApiIdNotFoundException, ApiWrongParamsException {
        Segment segment = segmentService.getById(id).orElseThrow(() -> new ApiIdNotFoundException("Segment", id));

        Checkpoint start = checkpointService.findCheckpoint(segmentUpdateModel.getCheckpointStartId());
        Checkpoint end = checkpointService.findCheckpoint(segmentUpdateModel.getCheckpointEndId());

        Challenge challenge = challengeService.findChallenge(segmentUpdateModel.getChallengeId());
        if (challenge == null) {
            throw new ApiIdNotFoundException("Challenge", segmentUpdateModel.getChallengeId());
        }

        if (start.getId().equals(end.getId())) {
            throw new ApiWrongParamsException("start-end", null,
                    "Les enpoint de début et de fin ne peuvent être les mêmes");
        }

        Segment persistedSegment = segmentService.update(segment, segmentUpdateModel);

        SegmentResponseModel response = modelMapper.map(persistedSegment, SegmentResponseModel.class);

        return ResponseEntity.ok().body(response);
    }

    @ApiOperation(value = "Supprimer un Segment par ID", response = Iterable.class, tags = "Segment")
    @ApiResponses(value = { //
            @ApiResponse(code = 200, message = "Success|OK"), //
            @ApiResponse(code = 401, message = "not authorized"), //
            @ApiResponse(code = 403, message = "forbidden"), //
            @ApiResponse(code = 404, message = "not found") //
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Long> delete(@PathVariable("id") Long id) throws ApiIdNotFoundException {
        Segment segment = segmentService.getById(id).orElseThrow(() -> new ApiIdNotFoundException("Segment", id));

        segmentService.delete(segment);

        return ResponseEntity.ok().body(segment.getId());
    }
}
