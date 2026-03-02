package com.eventmanagment.announcer.service;

import com.eventmanagment.announcer.dto.*;

import java.util.List;

//CRUD operations for AnnouncerWork
public interface AnnouncerWorkService {

    AnnouncerWorkResponseDTO addWork(AnnouncerWorkRequestDTO dto);

    AnnouncerWorkResponseDTO getWorkById(Long id);

    List<AnnouncerWorkResponseDTO> getWorksByAnnouncer(Long announcerId);

    List<AnnouncerWorkResponseDTO> getAllWorks();

    AnnouncerWorkResponseDTO updateWork(Long id, AnnouncerWorkRequestDTO dto);

    void deleteWork(Long id);
}