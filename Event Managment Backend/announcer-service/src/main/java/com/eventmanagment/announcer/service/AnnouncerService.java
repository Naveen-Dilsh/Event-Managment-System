package com.eventmanagment.announcer.service;

import com.eventmanagment.announcer.dto.*;

import java.util.List;

//CRUD operations for Announcer
public interface AnnouncerService {

    AnnouncerResponseDTO createAnnouncer(AnnouncerRequestDTO dto);

    AnnouncerResponseDTO getAnnouncerById(Long id);

    List<AnnouncerResponseDTO> getAllAnnouncers();

    AnnouncerResponseDTO updateAnnouncer(Long id, AnnouncerRequestDTO dto);

    void deleteAnnouncer(Long id);
}