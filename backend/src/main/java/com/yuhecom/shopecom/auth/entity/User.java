package com.yuhecom.shopecom.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.yuhecom.shopecom.entity.Address;
import jakarta.annotation.Resource;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="ath_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    private String firstName;

    private String lastName;

    @JsonIgnore
    private String password;

    private String email;

    private Date createdOn;

    private Date updatedOn;

    private String provider;

    private String verificationCode;

    private String phoneNumber;

    private boolean enabled=false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name= "ath_user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "authority_id"))
    private List<Authority>  authorities;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Address> addressList;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }



}
