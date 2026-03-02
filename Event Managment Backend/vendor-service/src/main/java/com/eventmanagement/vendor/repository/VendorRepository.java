package com.eventmanagement.vendor.repository;

import com.eventmanagement.vendor.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {

    /**
     * Find all vendors associated with a specific event
     */
    List<Vendor> findByEventId(Long eventId);

    /**
     * Find vendors by vendor type (CATERING, EQUIPMENT, DECORATION, etc.)
     */
    List<Vendor> findByVendorType(String vendorType);

    /**
     * Find vendors by vendor type (case-insensitive)
     */
    List<Vendor> findByVendorTypeIgnoreCase(String vendorType);

    /**
     * Find vendors by contract status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
     */
    List<Vendor> findByContractStatus(String contractStatus);

    /**
     * Find vendors by vendor name (exact match)
     */
    Optional<Vendor> findByVendorName(String vendorName);

    /**
     * Find vendors by vendor name containing the search term (case-insensitive)
     */
    List<Vendor> findByVendorNameContainingIgnoreCase(String vendorName);

    /**
     * Find vendors by contact email
     */
    Optional<Vendor> findByContactEmail(String contactEmail);

    /**
     * Find vendors for a specific event with a specific vendor type
     */
    List<Vendor> findByEventIdAndVendorType(Long eventId, String vendorType);

    /**
     * Find vendors for a specific event with a specific contract status
     */
    List<Vendor> findByEventIdAndContractStatus(Long eventId, String contractStatus);

    /**
     * Find vendors with cost less than or equal to specified amount
     */
    List<Vendor> findByCostLessThanEqual(Double maxCost);

    /**
     * Custom query to find confirmed vendors for a specific event
     */
    @Query("SELECT v FROM Vendor v WHERE v.eventId = :eventId AND v.contractStatus = 'CONFIRMED'")
    List<Vendor> findConfirmedVendorsByEventId(@Param("eventId") Long eventId);

    /**
     * Custom query to find vendors by type within budget
     */
    @Query("SELECT v FROM Vendor v WHERE v.vendorType = :vendorType AND v.cost <= :maxBudget ORDER BY v.cost ASC")
    List<Vendor> findVendorsByTypeWithinBudget(@Param("vendorType") String vendorType,
            @Param("maxBudget") Double maxBudget);

    /**
     * Count vendors by event ID
     */
    Long countByEventId(Long eventId);

    /**
     * Count vendors by contract status
     */
    Long countByContractStatus(String contractStatus);

    /**
     * Check if vendor exists by vendor name
     */
    boolean existsByVendorName(String vendorName);

    /**
     * Delete all vendors by event ID
     */
    void deleteByEventId(Long eventId);
}
