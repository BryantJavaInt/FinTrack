package com.fintrack.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByAccountIdOrderByOccurredAtDesc(Long accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId ORDER BY t.occurredAt DESC")
    List<Transaction> findRecentByUserId(Long userId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.account.user.id = :userId")
    List<Transaction> findAllByUserId(Long userId);
}
