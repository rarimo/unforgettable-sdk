plugins {
    kotlin("jvm") version "1.9.21"
    kotlin("plugin.serialization") version "1.9.21"
    id("maven-publish")
}

group = "com.rarimo"
version = "1.0.0"

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib:1.9.21")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.2")
    implementation("com.google.crypto.tink:tink-android:1.13.0")
    
    testImplementation(kotlin("test"))
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
    testImplementation("junit:junit:4.13.2")
}

tasks.test {
    useJUnit()
}

kotlin {
    jvmToolchain(17)
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = "com.rarimo"
            artifactId = "unforgettable-sdk"
            version = "1.0.0"
            
            from(components["java"])
            
            pom {
                name.set("Unforgettable SDK")
                description.set("Kotlin SDK for Unforgettable account recovery")
                url.set("https://unforgettable.app")
                
                licenses {
                    license {
                        name.set("MIT License")
                        url.set("https://opensource.org/licenses/MIT")
                    }
                }
                
                developers {
                    developer {
                        organization.set("Rarimo")
                        organizationUrl.set("https://github.com/rarimo")
                    }
                }
                
                scm {
                    connection.set("scm:git:git://github.com/rarimo/unforgettable-sdk.git")
                    developerConnection.set("scm:git:ssh://github.com/rarimo/unforgettable-sdk.git")
                    url.set("https://github.com/rarimo/unforgettable-sdk")
                }
            }
        }
    }
}
