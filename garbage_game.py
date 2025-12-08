import pygame
import random
import sys

pygame.init()

WIDTH, HEIGHT = 800, 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 200, 0)
RED = (255, 50, 50)
BLUE = (100, 150, 255)
YELLOW = (255, 200, 0)

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Eco Collector - Save the Planet!")
clock = pygame.time.Clock()

font_large = pygame.font.Font(None, 48)
font_medium = pygame.font.Font(None, 36)
font_small = pygame.font.Font(None, 28)

class Player:
    def __init__(self):
        self.width = 80
        self.height = 60
        self.x = WIDTH // 2 - self.width // 2
        self.y = HEIGHT - 100
        self.speed = 7

    def move(self, direction):
        self.x += direction * self.speed
        self.x = max(0, min(WIDTH - self.width, self.x))

    def draw(self, surface):
        pygame.draw.rect(surface, BLUE, (self.x, self.y, self.width, self.height))
        pygame.draw.rect(surface, BLACK, (self.x, self.y, self.width, self.height), 3)
        pygame.draw.rect(surface, (150, 200, 255), (self.x + 10, self.y + 10, self.width - 20, 20))

class FallingItem:
    def __init__(self):
        self.width = 40
        self.height = 40
        self.x = random.randint(0, WIDTH - self.width)
        self.y = -self.height
        self.speed = random.randint(3, 5)
        self.is_recyclable = random.random() < 0.6
        self.color = GREEN if self.is_recyclable else RED

    def update(self):
        self.y += self.speed

    def draw(self, surface):
        if self.is_recyclable:
            pygame.draw.circle(surface, self.color,
                             (self.x + self.width // 2, self.y + self.height // 2),
                             self.width // 2)
            pygame.draw.circle(surface, BLACK,
                             (self.x + self.width // 2, self.y + self.height // 2),
                             self.width // 2, 2)
            symbol = font_small.render("♻", True, WHITE)
            surface.blit(symbol, (self.x + 8, self.y + 5))
        else:
            pygame.draw.rect(surface, self.color,
                           (self.x, self.y, self.width, self.height))
            pygame.draw.rect(surface, BLACK,
                           (self.x, self.y, self.width, self.height), 2)
            line_start = (self.x + 10, self.y + 10)
            line_end = (self.x + self.width - 10, self.y + self.height - 10)
            pygame.draw.line(surface, BLACK, line_start, line_end, 3)

    def is_off_screen(self):
        return self.y > HEIGHT

    def collides_with(self, player):
        return (self.x < player.x + player.width and
                self.x + self.width > player.x and
                self.y < player.y + player.height and
                self.y + self.height > player.y)

def draw_background(surface):
    surface.fill((220, 240, 255))
    for i in range(0, HEIGHT, 40):
        pygame.draw.line(surface, (200, 220, 240), (0, i), (WIDTH, i), 1)

def main():
    player = Player()
    items = []
    score = 0
    missed_recyclables = 0
    game_over = False
    spawn_timer = 0
    spawn_delay = 60

    running = True
    while running:
        clock.tick(60)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN and game_over:
                if event.key == pygame.K_r:
                    return main()
                if event.key == pygame.K_q:
                    running = False

        if not game_over:
            keys = pygame.key.get_pressed()
            if keys[pygame.K_LEFT] or keys[pygame.K_a]:
                player.move(-1)
            if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
                player.move(1)

            spawn_timer += 1
            if spawn_timer >= spawn_delay:
                items.append(FallingItem())
                spawn_timer = 0
                spawn_delay = max(20, 60 - score // 5)

            for item in items[:]:
                item.update()

                if item.collides_with(player):
                    if item.is_recyclable:
                        score += 10
                    else:
                        score -= 5
                    items.remove(item)
                elif item.is_off_screen():
                    if item.is_recyclable:
                        missed_recyclables += 1
                    items.remove(item)

            if missed_recyclables >= 10:
                game_over = True

        draw_background(screen)

        for item in items:
            item.draw(screen)

        player.draw(screen)

        score_text = font_medium.render(f"Score: {score}", True, BLACK)
        screen.blit(score_text, (10, 10))

        missed_text = font_small.render(f"Missed: {missed_recyclables}/10", True, RED)
        screen.blit(missed_text, (10, 50))

        instruction_text = font_small.render("← → or A D to move", True, BLACK)
        screen.blit(instruction_text, (WIDTH - 250, 10))

        if game_over:
            overlay = pygame.Surface((WIDTH, HEIGHT))
            overlay.set_alpha(200)
            overlay.fill(BLACK)
            screen.blit(overlay, (0, 0))

            game_over_text = font_large.render("GAME OVER!", True, RED)
            final_score_text = font_medium.render(f"Final Score: {score}", True, WHITE)
            restart_text = font_small.render("Press R to Restart or Q to Quit", True, YELLOW)

            screen.blit(game_over_text, (WIDTH // 2 - 150, HEIGHT // 2 - 80))
            screen.blit(final_score_text, (WIDTH // 2 - 130, HEIGHT // 2 - 20))
            screen.blit(restart_text, (WIDTH // 2 - 180, HEIGHT // 2 + 40))

        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
