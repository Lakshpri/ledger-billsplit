package com.notebook.splitter.repository;

import com.notebook.splitter.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT DISTINCT g FROM Group g JOIN g.members m WHERE m.user.id = :userId ORDER BY g.createdAt DESC")
    List<Group> findAllForUser(@Param("userId") Long userId);
}
