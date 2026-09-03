package com.notebook.splitter.service;

import com.notebook.splitter.dto.GroupDto;
import com.notebook.splitter.dto.GroupRequest;
import com.notebook.splitter.dto.UserDto;
import com.notebook.splitter.entity.Group;
import com.notebook.splitter.entity.GroupMember;
import com.notebook.splitter.entity.User;
import com.notebook.splitter.exception.ApiException;
import com.notebook.splitter.repository.GroupMemberRepository;
import com.notebook.splitter.repository.GroupRepository;
import com.notebook.splitter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupDto createGroup(GroupRequest req, User creator) {
        Group group = Group.builder()
                .name(req.getName())
                .description(req.getDescription())
                .icon((req.getIcon() == null || req.getIcon().isBlank()) ? "\ud83d\udcd2" : req.getIcon())
                .baseCurrency((req.getBaseCurrency() == null || req.getBaseCurrency().isBlank())
                        ? "USD" : req.getBaseCurrency().toUpperCase())
                .createdBy(creator)
                .build();
        group = groupRepository.save(group);
        final Group savedGroup = group;

        addMember(savedGroup, creator);

        if (req.getMemberEmails() != null) {
            for (String email : req.getMemberEmails()) {
                if (email == null || email.isBlank()) continue;
                userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(u -> {
                    if (!groupMemberRepository.existsByGroupIdAndUserId(savedGroup.getId(), u.getId())) {
                        addMember(savedGroup, u);
                    }
                });
            }
        }

        return toDto(groupRepository.findById(savedGroup.getId()).orElseThrow());
    }

    private void addMember(Group group, User user) {
        GroupMember member = GroupMember.builder().group(group).user(user).build();
        groupMemberRepository.save(member);
    }

    public List<GroupDto> getGroupsForUser(Long userId) {
        return groupRepository.findAllForUser(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public GroupDto getGroup(Long groupId, Long requestingUserId) {
        Group group = requireGroup(groupId);
        requireMembership(groupId, requestingUserId);
        return toDto(group);
    }

    @Transactional
    public GroupDto addMemberByEmail(Long groupId, String email, Long requestingUserId) {
        Group group = requireGroup(groupId);
        requireMembership(groupId, requestingUserId);

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No user found with email " + email + ". They need to sign up first."));

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, user.getName() + " is already in this group");
        }

        addMember(group, user);
        return toDto(groupRepository.findById(groupId).orElseThrow());
    }

    public Group requireGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Group not found"));
    }

    public void requireMembership(Long groupId, Long userId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You're not a member of this group");
        }
    }

    public List<User> membersOf(Long groupId) {
        List<User> users = new ArrayList<>();
        groupMemberRepository.findByGroupId(groupId).forEach(gm -> users.add(gm.getUser()));
        return users;
    }

    private GroupDto toDto(Group g) {
        List<UserDto> members = groupMemberRepository.findByGroupId(g.getId()).stream()
                .map(gm -> UserDto.from(gm.getUser()))
                .collect(Collectors.toList());

        return GroupDto.builder()
                .id(g.getId())
                .name(g.getName())
                .description(g.getDescription())
                .icon(g.getIcon())
                .baseCurrency(g.getBaseCurrency())
                .createdBy(UserDto.from(g.getCreatedBy()))
                .members(members)
                .createdAt(g.getCreatedAt())
                .build();
    }
}